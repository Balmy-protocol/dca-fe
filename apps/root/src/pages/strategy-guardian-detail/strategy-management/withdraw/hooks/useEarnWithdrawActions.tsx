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
import { parseUnits } from 'viem';
import useTrackEvent from '@hooks/useTrackEvent';
import useActiveWallet from '@hooks/useActiveWallet';
import { shouldTrackError } from '@common/utils/errors';
import useErrorService from '@hooks/useErrorService';
import { Typography } from 'ui-library';
import useTransactionModal from '@hooks/useTransactionModal';
import { useTransactionAdder } from '@state/transactions/hooks';
import useEarnService from '@hooks/earn/useEarnService';
import { getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';
import { isSameToken } from '@common/utils/currency';
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
  const trackEvent = useTrackEvent();
  const errorService = useErrorService();
  const earnService = useEarnService();
  const [currentTransaction, setCurrentTransaction] = React.useState('');
  const { withdrawAmount: assetAmountInUnits, withdrawRewards } = useEarnManagementState();
  const addTransaction = useTransactionAdder();
  const [shouldShowConfirmation, setShouldShowConfirmation] = React.useState(false);
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();
  const [shouldShowSteps, setShouldShowSteps] = React.useState(false);
  const [transactionsToExecute, setTransactionsToExecute] = React.useState<TransactionStep[]>([]);

  const tokensToWithdraw = React.useMemo(() => {
    if (!activeWallet?.address || !strategy || !asset || !assetAmountInUnits) return;

    const currentPosition =
      activeWallet && strategy?.userPositions?.find((position) => position.owner === activeWallet.address);
    if (!currentPosition) return;

    const protocolToken = getProtocolToken(strategy.farm.chainId);
    const wrappedProtocolToken = getWrappedProtocolToken(strategy.farm.chainId);

    // Protocol tokens will be unwrapped
    const assetIsWrappedProtocol = isSameToken(wrappedProtocolToken, asset);

    const rewardsWithdrawAmounts = currentPosition.balances
      .filter((balance) => isSameToken(balance.token, asset))
      .map((balance) => ({
        amount: withdrawRewards ? balance.amount.amount : 0n,
        token: balance.token,
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
        trackEvent('EARN - Sign companion error', {
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

  const onWithdraw = React.useCallback(async () => {
    const notWithdrawing = !assetAmountInUnits && !withdrawRewards;
    if (!asset || !activeWallet?.address || !strategy || notWithdrawing || !tokensToWithdraw) return;

    const currentPosition = strategy.userPositions?.find((position) => position.owner === activeWallet.address);

    if (!currentPosition) return;

    try {
      setModalLoading({
        content: (
          <Typography variant="bodyRegular">
            <FormattedMessage
              description="earn.strategy-management.withdraw.modal.loading"
              defaultMessage="Withdrawing funds from {farm}"
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
      });

      let permissionSignature;
      if (transactionsToExecute?.length) {
        const companionSignIndex = findIndex(transactionsToExecute, {
          type: TRANSACTION_ACTION_APPROVE_COMPANION_SIGN_EARN,
        });

        if (companionSignIndex !== -1) {
          permissionSignature = (
            transactionsToExecute[companionSignIndex].extraData as TransactionActionEarnWithdrawData
          ).signature;
        }
      }

      const result = await earnService.withdrawPosition({
        earnPositionId: currentPosition.id,
        withdraw: tokensToWithdraw,
        permissionSignature,
      });

      const parsedTokensToWithdraw = tokensToWithdraw.map((token) => ({
        amount: token.amount.toString(),
        token: token.token,
        // TODO: Handle different withdraw types in BLY-3083
        withdrawType: WithdrawType.IMMEDIATE,
      }));

      const typeData: EarnWithdrawTypeData = {
        type: TransactionTypes.earnWithdraw,
        typeData: {
          strategyId: strategy.id,
          positionId: currentPosition.id,
          withdrawn: parsedTokensToWithdraw,
        },
      };

      trackEvent(`Earn - Withdraw position submitted`, {
        asset: asset.symbol,
        strategy: strategy.id,
        amount: assetAmountInUnits,
        withdrawRewards,
      });

      addTransaction(result, typeData);

      setModalClosed({ content: '' });

      setShouldShowConfirmation(true);
      setCurrentTransaction(result.hash);

      window.scrollTo(0, 0);

      if (transactionsToExecute?.length) {
        const newSteps = [...transactionsToExecute];

        const index = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_EARN_WITHDRAW });

        if (index !== -1) {
          newSteps[index] = {
            ...newSteps[index],
            hash: result.hash,
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
  }, [
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
  ]);

  const buildSteps = React.useCallback(() => {
    if (!asset || !assetAmountInUnits || assetAmountInUnits === '') {
      return [];
    }

    const newSteps: TransactionStep[] = [];

    newSteps.push({
      hash: '',
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
      onAction: () => onWithdraw(),
      checkForPending: true,
      done: false,
      type: TRANSACTION_ACTION_EARN_WITHDRAW,
      extraData: {
        asset,
        withdraw: [],
        signature: undefined,
      },
    });

    return newSteps;
  }, [asset, assetAmountInUnits, intl, onSignCompanionApproval, onWithdraw, strategy?.farm.name]);

  const handleMultiSteps = React.useCallback(() => {
    if (!asset || assetAmountInUnits === '' || !assetAmountInUnits) {
      return;
    }

    // Scroll to top of page
    window.scrollTo(0, 0);
    const newSteps = buildSteps();

    trackEvent('Earn - Withdraw - Start swap steps');
    setTransactionsToExecute(newSteps);
    setShouldShowSteps(true);
  }, [asset, assetAmountInUnits, buildSteps]);

  const currentTransactionStep = React.useMemo(() => {
    const foundStep = find(transactionsToExecute, { done: false });
    return foundStep?.type || null;
  }, [transactionsToExecute]);

  const transactionOnAction = React.useMemo(() => {
    switch (currentTransactionStep) {
      case TRANSACTION_ACTION_APPROVE_COMPANION_SIGN_EARN:
        return { onAction: onSignCompanionApproval };
      case TRANSACTION_ACTION_EARN_WITHDRAW:
        return { onAction: onWithdraw };
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
    ]
  );
};

export default useEarnWithdrawActions;