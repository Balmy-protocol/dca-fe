import React from 'react';
import { useEarnManagementState } from '@state/earn-management/hooks';
import {
  DisplayStrategy,
  EarnPermission,
  EarnWithdrawTypeData,
  SignStatus,
  TransactionActionApproveCompanionSignEarnData,
  TransactionActionEarnWithdrawData,
  TransactionApplicationIdentifier,
  TransactionTypes,
  WithdrawType,
} from 'common-types';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import { Hash, parseUnits } from 'viem';
import useAnalytics from '@hooks/useAnalytics';
import useActiveWallet from '@hooks/useActiveWallet';
import { shouldTrackError } from '@common/utils/errors';
import useErrorService from '@hooks/useErrorService';
import { Typography } from 'ui-library';
import useTransactionModal from '@hooks/useTransactionModal';
import { useTransactionAdder } from '@state/transactions/hooks';
import useEarnService from '@hooks/earn/useEarnService';
import { getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';
import { isSameToken, parseUsdPrice, parseNumberUsdPriceToBigInt } from '@common/utils/currency';
import { TransactionAction, TransactionAction as TransactionStep } from '@common/components/transaction-steps';
import { find, findIndex } from 'lodash';
import { TRANSACTION_ACTION_APPROVE_COMPANION_SIGN_EARN, TRANSACTION_ACTION_EARN_WITHDRAW } from '@constants';

interface UseEarnWithdrawActionsParams {
  strategy?: DisplayStrategy;
}

const useEarnWithdrawActions = ({ strategy }: UseEarnWithdrawActionsParams) => {
  const intl = useIntl();
  const asset = strategy?.asset;
  const activeWallet = useActiveWallet();
  const { trackEvent } = useAnalytics();
  const errorService = useErrorService();
  const earnService = useEarnService();
  const [currentTransaction, setCurrentTransaction] = React.useState<{ hash: Hash; chainId: number } | undefined>();
  const { withdrawAmount: assetAmountInUnits, withdrawRewards } = useEarnManagementState();
  const addTransaction = useTransactionAdder();
  const [shouldShowConfirmation, setShouldShowConfirmation] = React.useState(false);
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();
  const [shouldShowSteps, setShouldShowSteps] = React.useState(false);
  const [transactionsToExecute, setTransactionsToExecute] = React.useState<TransactionStep[]>([]);
  const [shouldShowMarketWithdrawModal, setShouldShowMarketWithdrawModal] = React.useState(false);

  const tokensToWithdraw = React.useMemo(() => {
    if (!activeWallet?.address || !strategy || !asset) return;

    const currentPosition =
      activeWallet && strategy?.userPositions?.find((position) => position.owner === activeWallet.address);
    if (!currentPosition) return;

    const protocolToken = getProtocolToken(strategy.farm.chainId);
    const wrappedProtocolToken = getWrappedProtocolToken(strategy.farm.chainId);

    // Protocol tokens will be unwrapped
    const assetIsWrappedProtocol = isSameToken(wrappedProtocolToken, asset);

    const rewardsWithdrawAmounts = currentPosition.balances
      .filter((balance) => !isSameToken(balance.token, asset))
      .map((balance) => ({
        amount: withdrawRewards ? balance.amount.amount : 0n,
        token: balance.token,
        convertTo: undefined,
      }));

    // Build the list with all the tokens, always asset token first
    const withdrawList = [
      {
        amount: parseUnits(assetAmountInUnits || '0', asset.decimals),
        token: asset,
        convertTo: assetIsWrappedProtocol ? protocolToken.address : undefined,
      },
      ...rewardsWithdrawAmounts,
    ];

    return withdrawList;
  }, [activeWallet?.address, asset, assetAmountInUnits, strategy, withdrawRewards]);

  const onSignCompanionApproval = React.useCallback(async () => {
    if (!activeWallet?.address || !strategy || !asset || !assetAmountInUnits) return;

    const currentPosition = strategy.userPositions?.find((position) => position.owner === activeWallet.address);
    if (!currentPosition) return;

    try {
      trackEvent('Earn Withdraw - Sign companion submitting', {
        fromSteps: !!transactionsToExecute?.length,
      });

      const result = await earnService.getSignatureForPermission({
        chainId: strategy.farm.chainId,
        earnPositionId: currentPosition.id,
        permission: EarnPermission.WITHDRAW,
      });

      trackEvent('Earn Withdraw - Sign companion submitting', {
        fromSteps: !!transactionsToExecute?.length,
      });

      if (transactionsToExecute?.length) {
        const newSteps = [...transactionsToExecute];

        const approveSignIndex = findIndex(transactionsToExecute, {
          type: TRANSACTION_ACTION_APPROVE_COMPANION_SIGN_EARN,
        });

        if (approveSignIndex !== -1) {
          newSteps[approveSignIndex] = {
            ...newSteps[approveSignIndex],
            extraData: {
              ...(newSteps[approveSignIndex].extraData as unknown as TransactionActionApproveCompanionSignEarnData),
              signStatus: SignStatus.signed,
            },
            done: true,
            checkForPending: false,
          } as TransactionAction;
        }

        const withdrawIndex = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_EARN_WITHDRAW });

        if (withdrawIndex !== -1) {
          newSteps[withdrawIndex] = {
            ...newSteps[withdrawIndex],
            extraData: {
              ...(newSteps[withdrawIndex].extraData as unknown as TransactionActionEarnWithdrawData),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
              signature: result as unknown as any,
            },
          } as TransactionAction;
        }

        setTransactionsToExecute(newSteps);
      }
    } catch (e) {
      if (shouldTrackError(e as Error)) {
        trackEvent('Earn - Sign companion error', {
          fromSteps: !!transactionsToExecute?.length,
        });
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error signing companion Earn', JSON.stringify(e), {
          chainId: strategy.network.chainId,
          asset: asset?.address,
        });
      }

      if (transactionsToExecute?.length) {
        const newSteps = [...transactionsToExecute];

        const approveIndex = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_APPROVE_COMPANION_SIGN_EARN });

        if (approveIndex !== -1) {
          newSteps[approveIndex] = {
            ...newSteps[approveIndex],
            extraData: {
              ...(newSteps[approveIndex].extraData as unknown as TransactionActionApproveCompanionSignEarnData),
              signStatus: SignStatus.failed,
            },
          } as TransactionAction;
        }

        setTransactionsToExecute(newSteps);
      }
    }
  }, [activeWallet?.address, asset, errorService, strategy, transactionsToExecute]);

  const onWithdraw = React.useCallback(
    async (assetWithdrawType: WithdrawType) => {
      const notWithdrawing = !assetAmountInUnits && !withdrawRewards;
      if (!asset || !activeWallet?.address || !strategy || notWithdrawing || !tokensToWithdraw) return;

      const currentPosition = strategy.userPositions?.find((position) => position.owner === activeWallet.address);

      if (!currentPosition) return;

      try {
        setModalLoading({
          content:
            assetWithdrawType === WithdrawType.DELAYED ? (
              <Typography variant="bodyRegular">
                <FormattedMessage
                  description="earn.strategy-management.delayed-withdraw.modal.loading"
                  defaultMessage="Your funds are being queued for withdrawal from {farm}. They'll be ready for you soon! 🕒. {rewards}"
                  values={{
                    farm: strategy.farm.name,
                    rewards: withdrawRewards
                      ? intl.formatMessage(
                          defineMessage({
                            description: 'earn.strategy-management.withdraw.modal.rewards',
                            defaultMessage: 'Your rewards will be withdrawn immediately',
                          })
                        )
                      : '',
                  }}
                />
              </Typography>
            ) : (
              <Typography variant="bodyRegular">
                <FormattedMessage
                  description="earn.strategy-management.withdraw.modal.loading"
                  defaultMessage="You are now withdrawing funds from {farm}. Time to enjoy the rewards you've cultivated 🎉"
                  values={{ farm: strategy.farm.name }}
                />
              </Typography>
            ),
        });

        trackEvent(`Earn - Withdraw position submitting`, {
          asset: asset.symbol,
          chainId: strategy.farm.chainId,
          amount: assetAmountInUnits,
          withdrawRewards,
          withdrawType: assetWithdrawType,
        });

        let permissionSignature;
        if (transactionsToExecute?.length) {
          const withdrawIndex = findIndex(transactionsToExecute, {
            type: TRANSACTION_ACTION_EARN_WITHDRAW,
          });

          if (withdrawIndex !== -1) {
            permissionSignature = (transactionsToExecute[withdrawIndex].extraData as TransactionActionEarnWithdrawData)
              .signature;
          }
        }

        const parsedTokensToWithdraw = tokensToWithdraw.map((withdraw) => {
          if (isSameToken(withdraw.token, asset)) {
            return {
              ...withdraw,
              withdrawType: assetWithdrawType,
              convertTo: assetWithdrawType !== WithdrawType.DELAYED ? withdraw.convertTo : undefined,
            };
          }

          // Avoid delay withdraw for rewards
          const canImmediateWithdraw = strategy.rewards.tokens
            .find((reward) => isSameToken(reward, withdraw.token))
            ?.withdrawTypes.includes(WithdrawType.IMMEDIATE);

          return {
            ...withdraw,
            withdrawType: canImmediateWithdraw ? WithdrawType.IMMEDIATE : WithdrawType.MARKET,
          };
        });

        const result = await earnService.withdrawPosition({
          earnPositionId: currentPosition.id,
          withdraw: parsedTokensToWithdraw,
          permissionSignature,
        });

        const tokensToWithdrawTypeData = parsedTokensToWithdraw.map((withdraw) => ({
          ...withdraw,
          amount: withdraw.amount.toString(),
        }));

        const amountInUsd = parsedTokensToWithdraw.reduce((acc, withdraw) => {
          return (
            acc + parseUsdPrice(withdraw.token, withdraw.amount, parseNumberUsdPriceToBigInt(withdraw.token.price ?? 0))
          );
        }, 0);
        const typeData: EarnWithdrawTypeData = {
          type: TransactionTypes.earnWithdraw,
          typeData: {
            strategyId: strategy.id,
            positionId: currentPosition.id,
            withdrawn: tokensToWithdrawTypeData,
            signedPermit: !!permissionSignature,
          },
        };

        trackEvent(`Earn - Withdraw position submitted`, {
          asset: asset.symbol,
          strategy: strategy.id,
          amount: assetAmountInUnits,
          withdrawRewards,
          amountInUsd,
          withdrawType: assetWithdrawType,
        });

        addTransaction(result, typeData);

        setModalClosed({ content: '' });

        setShouldShowConfirmation(true);
        setCurrentTransaction({
          hash: result.hash,
          chainId: strategy.network.chainId,
        });

        window.scrollTo(0, 0);

        if (transactionsToExecute?.length) {
          const newSteps = [...transactionsToExecute];

          const index = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_EARN_WITHDRAW });

          if (index !== -1) {
            newSteps[index] = {
              ...newSteps[index],
              hash: result.hash,
              chainId: strategy.network.chainId,
              done: true,
            };

            setTransactionsToExecute(newSteps);
          }
        }
      } catch (e) {
        // User rejecting transaction
        if (shouldTrackError(e as Error)) {
          trackEvent('Earn - Withdraw position error');
          // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          void errorService.logError('Error withdrawing position', JSON.stringify(e), {
            asset: asset.address,
            chainId: strategy.network.chainId,
          });
        }

        setModalError({
          content: (
            <FormattedMessage
              description="earn.strategy-management.withdraw.modal.error"
              defaultMessage="Error withdrawing"
            />
          ),
          /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
          error: {
            ...e,
            extraData: {
              asset: asset.address,
              chainId: strategy.network.chainId,
              assetAmountInUnits,
              withdrawRewards,
            },
          },
        });
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      }
    },
    [
      activeWallet?.address,
      addTransaction,
      asset,
      assetAmountInUnits,
      earnService,
      errorService,
      strategy,
      tokensToWithdraw,
      transactionsToExecute,
      withdrawRewards,
      intl,
    ]
  );

  const buildSteps = React.useCallback(
    (assetWithdrawType: WithdrawType) => {
      if (!asset || !assetAmountInUnits || assetAmountInUnits === '') {
        return [];
      }

      const newSteps: TransactionStep[] = [];

      newSteps.push({
        hash: '',
        chainId: strategy.network.chainId,
        onAction: onSignCompanionApproval,
        checkForPending: false,
        done: false,
        type: TRANSACTION_ACTION_APPROVE_COMPANION_SIGN_EARN,
        explanation: intl.formatMessage(
          defineMessage({
            description: 'earn.strategy-management.withdraw.tx-steps.sign-companion-approval',
            defaultMessage: 'Balmy now needs your explicit authorization to withdraw from your investment on {farm}',
          }),
          { farm: strategy.farm.name }
        ),
        extraData: {
          signStatus: SignStatus.none,
          type: EarnPermission.WITHDRAW,
        },
      });

      newSteps.push({
        hash: '',
        chainId: strategy.network.chainId,
        onAction: () => onWithdraw(assetWithdrawType),
        checkForPending: true,
        done: false,
        type: TRANSACTION_ACTION_EARN_WITHDRAW,
        extraData: {
          asset,
          withdraw: [],
          signature: undefined,
          assetWithdrawType,
        },
      });

      return newSteps;
    },
    [asset, assetAmountInUnits, intl, onSignCompanionApproval, onWithdraw, strategy?.farm.name]
  );

  const handleMultiSteps = React.useCallback(
    (assetWithdrawType: WithdrawType) => {
      if (!asset || assetAmountInUnits === '' || !assetAmountInUnits) {
        return;
      }

      // Scroll to top of page
      window.scrollTo(0, 0);
      const newSteps = buildSteps(assetWithdrawType);

      trackEvent('Earn - Withdraw - Start swap steps', {
        withdrawType: assetWithdrawType,
      });
      setTransactionsToExecute(newSteps);
      setShouldShowSteps(true);
    },
    [asset, assetAmountInUnits, buildSteps]
  );

  const currentTransactionStep = React.useMemo(() => {
    const foundStep = find(transactionsToExecute, { done: false });
    return foundStep?.type || null;
  }, [transactionsToExecute]);

  const transactionOnAction = React.useMemo(() => {
    const canImmediateWithdraw = strategy?.asset.withdrawTypes.includes(WithdrawType.IMMEDIATE);
    switch (currentTransactionStep) {
      case TRANSACTION_ACTION_APPROVE_COMPANION_SIGN_EARN:
        return { onAction: onSignCompanionApproval };
      case TRANSACTION_ACTION_EARN_WITHDRAW:
        return { onAction: () => onWithdraw(canImmediateWithdraw ? WithdrawType.IMMEDIATE : WithdrawType.MARKET) };
      default:
        return { onAction: () => {} };
    }
  }, [currentTransactionStep]);

  const handleBackTransactionSteps = React.useCallback(() => {
    setShouldShowSteps(false);
    trackEvent('Earn - Withdraw - Back from steps');
  }, []);

  return React.useMemo(
    () => ({
      shouldShowConfirmation,
      onWithdraw,
      currentTransaction,
      setShouldShowConfirmation,
      transactionOnAction,
      handleMultiSteps,
      transactionSteps: transactionsToExecute,
      shouldShowSteps,
      handleBackTransactionSteps,
      tokensToWithdraw,
      applicationIdentifier: TransactionApplicationIdentifier.EARN_WITHDRAW,
      shouldShowMarketWithdrawModal,
      setShouldShowMarketWithdrawModal,
    }),
    [
      shouldShowConfirmation,
      currentTransaction,
      onWithdraw,
      transactionOnAction,
      handleMultiSteps,
      transactionsToExecute,
      shouldShowSteps,
      handleBackTransactionSteps,
      tokensToWithdraw,
      shouldShowMarketWithdrawModal,
      setShouldShowMarketWithdrawModal,
    ]
  );
};

export default useEarnWithdrawActions;
