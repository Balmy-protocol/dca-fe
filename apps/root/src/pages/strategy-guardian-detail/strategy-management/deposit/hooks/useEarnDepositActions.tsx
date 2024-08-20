import React from 'react';
import { useEarnManagementState } from '@state/earn-management/hooks';
import {
  ApproveTokenExactTypeData,
  ApproveTokenTypeData,
  DisplayStrategy,
  EarnDepositTypeData,
  EarnIncreaseTypeData,
  SignStatus,
  TransactionActionApproveTokenSignEarnData,
  TransactionActionEarnDepositData,
  TransactionTypes,
} from 'common-types';
import find from 'lodash/find';
import { TransactionAction, TransactionAction as TransactionStep } from '@common/components/transaction-steps';
import {
  PERMIT_2_ADDRESS,
  TRANSACTION_ACTION_APPROVE_TOKEN,
  TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_EARN,
  TRANSACTION_ACTION_EARN_DEPOSIT,
} from '@constants';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import findIndex from 'lodash/findIndex';
import { parseUnits } from 'viem';
import useTrackEvent from '@hooks/useTrackEvent';
import useActiveWallet from '@hooks/useActiveWallet';
import usePermit2Service from '@hooks/usePermit2Service';
import { shouldTrackError } from '@common/utils/errors';
import useErrorService from '@hooks/useErrorService';
import { Typography } from 'ui-library';
import useWalletService from '@hooks/useWalletService';
import useTransactionModal from '@hooks/useTransactionModal';
import { useTransactionAdder } from '@state/transactions/hooks';
import useEarnService from '@hooks/earn/useEarnService';

interface UseEarnDepositActionParams {
  strategy?: DisplayStrategy;
}

export type EarnDepositStepsContextValue = {
  transactionSteps: TransactionStep[];
  shouldShowSteps: boolean;
  shouldShowConfirmation: boolean;
};

const useEarnDepositActions = ({ strategy }: UseEarnDepositActionParams) => {
  const asset = strategy?.asset;
  const intl = useIntl();
  const activeWallet = useActiveWallet();
  const trackEvent = useTrackEvent();
  const errorService = useErrorService();
  const permit2Service = usePermit2Service();
  const walletService = useWalletService();
  const earnService = useEarnService();
  const [currentTransaction, setCurrentTransaction] = React.useState('');
  const { assetAmount: assetAmountInUnits } = useEarnManagementState();
  const addTransaction = useTransactionAdder();
  const [shouldShowSteps, setShouldShowSteps] = React.useState(false);
  const [shouldShowConfirmation, setShouldShowConfirmation] = React.useState(false);
  const [transactionsToExecute, setTransactionsToExecute] = React.useState<TransactionStep[]>([]);
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();

  const onDeposit = React.useCallback(async () => {
    if (!asset || !assetAmountInUnits || !activeWallet?.address || !strategy) return;
    try {
      setModalLoading({
        content: (
          <Typography variant="bodyRegular">
            <FormattedMessage
              description="earn.strategy-management.deposit.tx-steps.deposit.loading"
              defaultMessage="Investing into {farm}"
              values={{ farm: strategy.farm.name }}
            />
          </Typography>
        ),
      });

      let signature;

      if (transactionsToExecute?.length) {
        const index = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_EARN_DEPOSIT });

        if (index !== -1) {
          signature = (transactionsToExecute[index].extraData as TransactionActionEarnDepositData).signature;
        }
      }

      const hasPosition = strategy.userPositions?.find((position) => position.owner === activeWallet.address);

      let result;

      trackEvent(`Earn - ${hasPosition ? 'Increase' : 'Create'} position submitting`);

      const baseTypeData = {
        asset: asset,
        assetAmount: parseUnits(assetAmountInUnits, asset.decimals),
        strategyId: strategy.id,
      };

      let typeData: EarnDepositTypeData | EarnIncreaseTypeData;

      if (!!hasPosition) {
        result = await earnService.increasePosition({
          earnPositionId: hasPosition.id,
          amount: parseUnits(assetAmountInUnits, asset.decimals),
          signature,
        });

        typeData = {
          type: TransactionTypes.earnIncrease,
          typeData: {
            ...baseTypeData,
            positionId: hasPosition.id,
          },
        };
      } else {
        result = await earnService.createPosition({
          strategyId: strategy.id,
          amount: parseUnits(assetAmountInUnits, asset.decimals),
          signature,
        });

        typeData = {
          type: TransactionTypes.earnDeposit,
          typeData: baseTypeData,
        };
      }

      try {
        trackEvent(`Earn - ${hasPosition ? 'Increase' : 'Create'} position submitted`, {
          asset: asset.symbol,
          strategy: strategy.id,
          amount: assetAmountInUnits,
        });
      } catch {}

      addTransaction(result, typeData);

      setModalClosed({ content: '' });

      if (transactionsToExecute?.length) {
        const newSteps = [...transactionsToExecute];

        const index = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_EARN_DEPOSIT });

        if (index !== -1) {
          newSteps[index] = {
            ...newSteps[index],
            hash: result.hash,
            done: true,
          };

          setTransactionsToExecute(newSteps);
        }
      }

      setShouldShowConfirmation(true);
      setShouldShowSteps(false);
      setCurrentTransaction(result.hash);

      window.scrollTo(0, 0);
    } catch (e) {
      // User rejecting transaction
      if (shouldTrackError(e as Error)) {
        trackEvent('Earn - Create position error');
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error creating position', JSON.stringify(e), {
          asset: asset.address,
          chainId: strategy.network.chainId,
        });
      }

      let signature;
      let signatureData;

      if (transactionsToExecute?.length) {
        const index = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_EARN_DEPOSIT });

        if (index !== -1) {
          signature = (transactionsToExecute[index].extraData as TransactionActionEarnDepositData).signature;
          signatureData = await permit2Service.getPermit2SignatureInfo(
            activeWallet.address,
            asset,
            parseUnits(assetAmountInUnits, asset.decimals)
          );
        }
      }

      setModalError({
        content: (
          <FormattedMessage
            description="earn.strategy-management.deposit.tx-steps.modal.error.deposit"
            defaultMessage="Error investing"
          />
        ),
        /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        error: {
          ...e,
          extraData: {
            asset: asset.address,
            chainId: strategy.network.chainId,
            signature,
            signatureData,
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
    permit2Service,
    strategy,
  ]);

  const onApproveToken = React.useCallback(
    async (amount?: bigint) => {
      if (!asset || !activeWallet?.address || !strategy) return;
      try {
        setModalLoading({
          content: (
            <Typography variant="bodyRegular">
              <FormattedMessage
                description="approving token"
                defaultMessage="Approving use of {asset}"
                values={{ asset: asset.symbol }}
              />
            </Typography>
          ),
        });
        trackEvent('Earn - Approve token submitting');
        const addressToApprove = PERMIT_2_ADDRESS[strategy.farm.chainId];

        const result = await walletService.approveSpecificToken(asset, addressToApprove, activeWallet.address, amount);

        trackEvent('Earn - Approve token submitted');

        const transactionTypeDataBase = {
          token: asset,
          addressFor: addressToApprove,
        };

        let transactionTypeData: ApproveTokenExactTypeData | ApproveTokenTypeData = {
          type: TransactionTypes.approveToken,
          typeData: transactionTypeDataBase,
        };

        if (amount) {
          transactionTypeData = {
            type: TransactionTypes.approveTokenExact,
            typeData: {
              ...transactionTypeDataBase,
              amount: amount.toString(),
            },
          };
        }

        addTransaction(result, transactionTypeData);

        setModalClosed({ content: '' });

        if (transactionsToExecute?.length) {
          const newSteps = [...transactionsToExecute];

          const approveIndex = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_APPROVE_TOKEN });

          if (approveIndex !== -1) {
            newSteps[approveIndex] = {
              ...newSteps[approveIndex],
              done: true,
              hash: result.hash,
            };
          }

          setTransactionsToExecute(newSteps);
        }
      } catch (e) {
        // User rejecting transaction
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        if (shouldTrackError(e as Error)) {
          trackEvent('Earn - Approve token error');
          // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          void errorService.logError('Error approving token', JSON.stringify(e), {
            asset: asset.address,
            chainId: strategy.farm.chainId,
          });
        }
        setModalError({
          content: <FormattedMessage description="modalErrorApprove" defaultMessage="Error approving token" />,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          error: {
            ...e,
            extraData: {
              asset: asset.address,
              chainId: strategy.farm.chainId,
            },
          },
        });
      }
    },
    [
      activeWallet?.address,
      addTransaction,
      asset,
      assetAmountInUnits,
      walletService,
      errorService,
      permit2Service,
      strategy,
    ]
  );

  const onSignPermit2Approval = React.useCallback(async () => {
    if (!activeWallet?.address || !strategy || !asset || !assetAmountInUnits) return;

    const amount = parseUnits(assetAmountInUnits, asset.decimals);
    try {
      trackEvent('Earn Deposit - Sign permi2Approval submitting', {
        fromSteps: !!transactionsToExecute?.length,
      });
      const result = await permit2Service.getPermit2EarnSignedData(
        activeWallet.address,
        strategy.network.chainId,
        asset,
        amount
      );
      trackEvent('Earn Deposit - Sign permi2Approval submitting', {
        fromSteps: !!transactionsToExecute?.length,
      });

      if (transactionsToExecute?.length) {
        const newSteps = [...transactionsToExecute];

        const approveIndex = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_EARN });

        if (approveIndex !== -1) {
          newSteps[approveIndex] = {
            ...newSteps[approveIndex],
            extraData: {
              ...(newSteps[approveIndex].extraData as unknown as TransactionActionApproveTokenSignEarnData),
              signStatus: SignStatus.signed,
            },
            done: true,
            checkForPending: false,
          } as TransactionAction;
        }

        const swapIndex = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_EARN_DEPOSIT });

        if (swapIndex !== -1) {
          newSteps[swapIndex] = {
            ...newSteps[swapIndex],
            extraData: {
              ...(newSteps[swapIndex].extraData as unknown as TransactionActionEarnDepositData),
              signature: result,
            },
          } as TransactionAction;
        }

        setTransactionsToExecute(newSteps);
      }
    } catch (e) {
      if (shouldTrackError(e as Error)) {
        trackEvent('EARN - Sign permi2Approval error', {
          fromSteps: !!transactionsToExecute?.length,
        });
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error signing permi2Approval Earn', JSON.stringify(e), {
          chainId: strategy.network.chainId,
          asset: asset?.address,
        });
      }

      if (transactionsToExecute?.length) {
        const newSteps = [...transactionsToExecute];

        const approveIndex = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_EARN });

        if (approveIndex !== -1) {
          newSteps[approveIndex] = {
            ...newSteps[approveIndex],
            extraData: {
              ...(newSteps[approveIndex].extraData as unknown as TransactionActionApproveTokenSignEarnData),
              signStatus: SignStatus.failed,
            },
          } as TransactionAction;
        }

        setTransactionsToExecute(newSteps);
      }
    }
  }, [activeWallet?.address, asset, errorService, permit2Service, strategy, transactionsToExecute]);

  const onApproveTransactionConfirmed = React.useCallback(
    (hash: string) => {
      if (!transactionsToExecute?.length) {
        return null;
      }

      const newSteps = [...transactionsToExecute];

      const index = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_APPROVE_TOKEN });

      if (index !== -1) {
        newSteps[index] = {
          ...newSteps[index],
          hash,
          done: true,
        };

        setTransactionsToExecute(newSteps);
      }

      return null;
    },
    [transactionsToExecute]
  );

  const buildSteps = React.useCallback(
    (isApproved?: boolean) => {
      if (!asset || !assetAmountInUnits || assetAmountInUnits === '') {
        return [];
      }

      const assetAmount = parseUnits(assetAmountInUnits, asset.decimals);
      const newSteps: TransactionStep[] = [];

      if (!isApproved) {
        newSteps.push({
          hash: '',
          onAction: (amount) => onApproveToken(amount),
          onActionConfirmed: (hash) => onApproveTransactionConfirmed(hash),
          checkForPending: false,
          done: false,
          type: TRANSACTION_ACTION_APPROVE_TOKEN,
          explanation: intl.formatMessage(
            defineMessage({
              description: 'approveTokenExplanation',
              defaultMessage:
                'By enabling Universal Approval, you will be able to use Uniswap, Balmy, swap aggregators and more protocols without having to authorize each one of them',
            })
          ),
          extraData: {
            token: asset,
            amount: assetAmount,
            swapper: intl.formatMessage(
              defineMessage({
                description: 'us',
                defaultMessage: 'us',
              })
            ),
            isPermit2Enabled: true,
          },
        });
      }

      newSteps.push({
        hash: '',
        onAction: onSignPermit2Approval,
        checkForPending: false,
        done: false,
        type: TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_EARN,
        explanation: intl.formatMessage(
          defineMessage({
            description: 'earn.strategy-management.deposit.tx-steps.sign-permit2',
            defaultMessage: 'Balmy now needs your explicit authorization to invest your {asset}',
          }),
          { asset: asset.symbol }
        ),
        extraData: {
          asset,
          assetAmount,
          signStatus: SignStatus.none,
        },
      });

      newSteps.push({
        hash: '',
        onAction: () => onDeposit(),
        checkForPending: true,
        done: false,
        type: TRANSACTION_ACTION_EARN_DEPOSIT,
        extraData: {
          asset,
          assetAmount,
        },
      });

      return newSteps;
    },
    [asset, assetAmountInUnits, intl, onApproveToken, onDeposit, onSignPermit2Approval, onApproveTransactionConfirmed]
  );

  const handleMultiSteps = React.useCallback(
    (isApproved?: boolean) => {
      if (!asset || assetAmountInUnits === '' || !assetAmountInUnits) {
        return;
      }

      // Scroll to top of page
      window.scrollTo(0, 0);
      const newSteps = buildSteps(isApproved);

      trackEvent('Aggregator - Start swap steps');
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
    switch (currentTransactionStep) {
      case TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_EARN:
        return { onAction: onSignPermit2Approval };
      case TRANSACTION_ACTION_APPROVE_TOKEN:
        return { onAction: onApproveToken, onActionConfirmed: onApproveTransactionConfirmed };
      case TRANSACTION_ACTION_EARN_DEPOSIT:
        return { onAction: onDeposit };
      default:
        return { onAction: () => {} };
    }
  }, [currentTransactionStep]);

  const handleBackTransactionSteps = React.useCallback(() => {
    setShouldShowSteps(false);
    trackEvent('Earn - Back from steps');
  }, []);

  return React.useMemo(
    () => ({
      transactionSteps: transactionsToExecute,
      shouldShowSteps,
      shouldShowConfirmation,
      handleMultiSteps,
      onDeposit,
      currentTransaction,
      transactionOnAction,
      handleBackTransactionSteps,
      setShouldShowConfirmation,
    }),
    [
      transactionsToExecute,
      setShouldShowConfirmation,
      shouldShowSteps,
      shouldShowConfirmation,
      currentTransaction,
      transactionOnAction,
      handleBackTransactionSteps,
      onDeposit,
      handleMultiSteps,
    ]
  );
};

export default useEarnDepositActions;
