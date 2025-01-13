import React from 'react';
import { useEarnManagementState } from '@state/earn-management/hooks';
import {
  ApproveTokenExactTypeData,
  ApproveTokenTypeData,
  DisplayStrategy,
  EarnCreateTypeData,
  EarnIncreaseTypeData,
  EarnPermission,
  SignStatus,
  TransactionActionApproveCompanionSignEarnData,
  TransactionActionApproveTokenSignEarnData,
  TransactionActionEarnDepositData,
  TransactionActionSignToSEarnData,
  TransactionApplicationIdentifier,
  TransactionTypes,
} from 'common-types';
import find from 'lodash/find';
import { TransactionAction, TransactionAction as TransactionStep } from '@common/components/transaction-steps';
import {
  EARN_VAULT_ADDRESS,
  PERMIT_2_ADDRESS,
  TRANSACTION_ACTION_APPROVE_COMPANION_SIGN_EARN,
  TRANSACTION_ACTION_APPROVE_TOKEN,
  TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_EARN,
  TRANSACTION_ACTION_EARN_DEPOSIT,
  TRANSACTION_ACTION_SIGN_TOS_EARN,
} from '@constants';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import findIndex from 'lodash/findIndex';
import { Hash, parseUnits } from 'viem';
import useAnalytics from '@hooks/useAnalytics';
import useActiveWallet from '@hooks/useActiveWallet';
import usePermit2Service from '@hooks/usePermit2Service';
import { shouldTrackError } from '@common/utils/errors';
import useErrorService from '@hooks/useErrorService';
import { Typography } from 'ui-library';
import useWalletService from '@hooks/useWalletService';
import useTransactionModal from '@hooks/useTransactionModal';
import { useTransactionAdder } from '@state/transactions/hooks';
import useEarnService from '@hooks/earn/useEarnService';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useContractService from '@hooks/useContractService';
import { parseNumberUsdPriceToBigInt, parseUsdPrice } from '@common/utils/currency';
import { setTriggerSteps } from '@state/earn-management/actions';
import { useAppDispatch } from '@state/hooks';

interface UseEarnDepositActionParams {
  strategy?: DisplayStrategy;
}

const useEarnDepositActions = ({ strategy }: UseEarnDepositActionParams) => {
  const { asset: baseAsset, depositAsset, depositAmount, depositAssetAmount, triggerSteps } = useEarnManagementState();
  const intl = useIntl();
  const activeWallet = useActiveWallet();
  const { trackEvent, trackEarnDeposit } = useAnalytics();
  const errorService = useErrorService();
  const permit2Service = usePermit2Service();
  const walletService = useWalletService();
  const earnService = useEarnService();
  const [currentTransaction, setCurrentTransaction] = React.useState<{ hash: Hash; chainId: number } | undefined>();
  const addTransaction = useTransactionAdder();
  const [shouldShowSteps, setShouldShowSteps] = React.useState(false);
  const [shouldShowConfirmation, setShouldShowConfirmation] = React.useState(false);
  const contractService = useContractService();
  const [transactionsToExecute, setTransactionsToExecute] = React.useState<TransactionStep[]>([]);
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();
  const asset = depositAsset || baseAsset;
  const assetAmountInUnits = depositAssetAmount || depositAmount;
  const dispatch = useAppDispatch();

  const onDeposit = React.useCallback(async () => {
    if (!asset || !assetAmountInUnits || !activeWallet?.address || !strategy || !baseAsset || !depositAmount) return;
    try {
      setModalLoading({
        content: (
          <Typography variant="bodyRegular">
            <FormattedMessage
              description="earn.strategy-management.deposit.tx-steps.create.loading"
              defaultMessage="You are now depositing funds into {farm}. Soon you'll be reaping the rewards you have worked so hard to achieve 🔥"
              values={{ farm: strategy.farm.name }}
            />
          </Typography>
        ),
      });

      let permitSignature;
      let permissionSignature;
      let tosSignature;

      if (transactionsToExecute?.length) {
        const index = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_EARN_DEPOSIT });

        if (index !== -1) {
          permitSignature = (transactionsToExecute[index].extraData as TransactionActionEarnDepositData)
            .permitSignature;
          permissionSignature = (transactionsToExecute[index].extraData as TransactionActionEarnDepositData)
            .permissionSignature;
          tosSignature = (transactionsToExecute[index].extraData as TransactionActionEarnDepositData).tosSignature;
        }
      }

      const hasPosition = strategy.userPositions?.find((position) => position.owner === activeWallet.address);

      let result;

      trackEvent(`Earn - ${hasPosition ? 'Increase' : 'Create'} position submitting`);

      const baseTypeData = {
        asset: baseAsset,
        assetAmount: parseUnits(depositAmount, baseAsset.decimals).toString(),
        strategyId: strategy.id,
        amountInUsd: parseUsdPrice(
          baseAsset,
          parseUnits(depositAmount, baseAsset.decimals),
          parseNumberUsdPriceToBigInt(baseAsset.price)
        ),
        isMigration: baseAsset.address !== asset.address,
        depositAsset,
        depositAssetAmount:
          depositAssetAmount && depositAsset
            ? parseUnits(depositAssetAmount, depositAsset.decimals).toString()
            : undefined,
      };

      let typeData: EarnCreateTypeData | EarnIncreaseTypeData;

      if (!!hasPosition) {
        result = await earnService.increasePosition({
          earnPositionId: hasPosition.id,
          amount: parseUnits(assetAmountInUnits, asset.decimals),
          asset,
          permitSignature,
          permissionSignature,
        });

        typeData = {
          type: TransactionTypes.earnIncrease,
          typeData: {
            ...baseTypeData,
            positionId: hasPosition.id,
            signedPermit: !!permissionSignature,
          },
        };
      } else {
        result = await earnService.createPosition({
          strategyId: strategy.id,
          amount: parseUnits(assetAmountInUnits, asset.decimals),
          asset,
          permitSignature,
          user: activeWallet.address,
          tosSignature,
        });

        typeData = {
          type: TransactionTypes.earnCreate,
          typeData: { ...baseTypeData, vault: EARN_VAULT_ADDRESS[strategy.network.chainId] },
        };
      }

      const parsedAmountInUSD = parseUsdPrice(
        asset,
        parseUnits(assetAmountInUnits, asset.decimals),
        parseNumberUsdPriceToBigInt(asset.price)
      );

      trackEvent(`Earn - ${hasPosition ? 'Increase' : 'Create'} position submitted`, {
        asset: baseAsset.symbol,
        strategy: strategy.id,
        amount: depositAmount,
        assetPrice: baseAsset.price,
        amountInUsd: parseUsdPrice(
          baseAsset,
          parseUnits(depositAmount, baseAsset.decimals),
          parseNumberUsdPriceToBigInt(baseAsset.price)
        ),
        isDeposit: !hasPosition,
        isIncrease: hasPosition,
        isMigration: baseAsset.address !== asset.address,
      });
      trackEarnDeposit({
        chainId: strategy.network.chainId,
        asset,
        strategy,
        parsedAmountInUSD,
        hasPosition: !!hasPosition,
      });

      addTransaction(result, typeData);

      setModalClosed({ content: '' });

      if (transactionsToExecute?.length) {
        const newSteps = [...transactionsToExecute];

        const index = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_EARN_DEPOSIT });

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

      setShouldShowConfirmation(true);
      setShouldShowSteps(false);
      setCurrentTransaction({
        hash: result.hash,
        chainId: strategy.network.chainId,
      });

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
          signature = (transactionsToExecute[index].extraData as TransactionActionEarnDepositData).permitSignature;
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
            description="earn.strategy-management.deposit.tx-steps.modal.error.create"
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
    transactionsToExecute,
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
        const addressToApprove = PERMIT_2_ADDRESS[strategy.network.chainId];

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
              hash: result.hash,
              chainId: strategy.network.chainId,
            };
          }

          setTransactionsToExecute(newSteps);
        }
      } catch (e) {
        console.error('Error approving token - Earn Deposit', e);
        // User rejecting transaction
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        if (shouldTrackError(e as Error)) {
          trackEvent('Earn - Approve token error');
          // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          void errorService.logError('Error approving token', JSON.stringify(e), {
            asset: asset.address,
            chainId: strategy.network.chainId,
          });
        }
        setModalError({
          content: <FormattedMessage description="modalErrorApprove" defaultMessage="Error approving token" />,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          error: {
            ...e,
            extraData: {
              asset: asset.address,
              chainId: strategy.network.chainId,
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
      transactionsToExecute,
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
              permitSignature: result,
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

  const onSignEarnToS = React.useCallback(async () => {
    if (!activeWallet?.address || !strategy) return;

    try {
      trackEvent('Earn Deposit - Sign ToS submitting', {
        fromSteps: !!transactionsToExecute?.length,
      });

      const result = await earnService.signStrategyToS(activeWallet.address, strategy.id);
      trackEvent('Earn Deposit - Sign ToS submitting', {
        fromSteps: !!transactionsToExecute?.length,
      });

      if (transactionsToExecute?.length) {
        const newSteps = [...transactionsToExecute];

        const signIndex = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_SIGN_TOS_EARN });

        if (signIndex !== -1) {
          newSteps[signIndex] = {
            ...newSteps[signIndex],
            extraData: {
              ...(newSteps[signIndex].extraData as unknown as TransactionActionSignToSEarnData),
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
              tosSignature: result,
            },
          } as TransactionAction;
        }

        setTransactionsToExecute(newSteps);
      }
    } catch (e) {
      if (shouldTrackError(e as Error)) {
        trackEvent('Earn - Sign ToS error', {
          fromSteps: !!transactionsToExecute?.length,
        });
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error signing ToS Earn', JSON.stringify(e), {
          chainId: strategy.network.chainId,
          asset: asset?.address,
        });
      }

      if (transactionsToExecute?.length) {
        const newSteps = [...transactionsToExecute];

        const signIndex = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_SIGN_TOS_EARN });

        if (signIndex !== -1) {
          newSteps[signIndex] = {
            ...newSteps[signIndex],
            extraData: {
              ...(newSteps[signIndex].extraData as unknown as TransactionActionSignToSEarnData),
              signStatus: SignStatus.failed,
            },
          } as TransactionAction;
        }

        setTransactionsToExecute(newSteps);
      }
    }
  }, [activeWallet?.address, errorService, earnService, strategy?.tos, transactionsToExecute]);

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

  const onSignCompanionApproval = React.useCallback(async () => {
    if (!activeWallet?.address || !strategy || !asset || !assetAmountInUnits) return;
    const currentPosition = strategy.userPositions?.find((position) => position.owner === activeWallet.address);
    if (!currentPosition) return;

    try {
      trackEvent('Earn Increase - Sign companion submitting', {
        fromSteps: !!transactionsToExecute?.length,
      });

      const result = await earnService.getSignatureForPermission({
        chainId: strategy.farm.chainId,
        earnPositionId: currentPosition.id,
        permission: EarnPermission.INCREASE,
      });

      trackEvent('Earn Increase - Sign companion submitting', {
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

        const depositIndex = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_EARN_DEPOSIT });

        if (depositIndex !== -1) {
          newSteps[depositIndex] = {
            ...newSteps[depositIndex],
            extraData: {
              ...(newSteps[depositIndex].extraData as unknown as TransactionActionEarnDepositData),
              permissionSignature: result,
            },
          } as TransactionAction;
        }

        setTransactionsToExecute(newSteps);
      }
    } catch (e) {
      if (shouldTrackError(e as Error)) {
        trackEvent('Eearn - Sign companion error', {
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
  }, [activeWallet?.address, asset, errorService, earnService, strategy, transactionsToExecute, assetAmountInUnits]);

  const isIncrease = React.useMemo(() => {
    const position = strategy?.userPositions?.find((userPosition) => userPosition.owner === activeWallet?.address);
    return !!position;
  }, [strategy?.userPositions, activeWallet?.address]);

  const userStrategy = React.useMemo(() => {
    if (!strategy || !activeWallet?.address) {
      return null;
    }

    return strategy.userPositions?.find((userPosition) => userPosition.owner === activeWallet.address);
  }, [strategy?.userPositions, activeWallet?.address]);

  const requiresCompanionSignature = React.useMemo(() => {
    if (!strategy || !activeWallet?.address) {
      return false;
    }

    const companionAddress = contractService.getEarnCompanionAddress(strategy.network.chainId);
    if (!companionAddress) return false;

    const companionHasPermission =
      !isIncrease || userStrategy?.permissions[companionAddress]?.includes(EarnPermission.INCREASE);

    return isIncrease && !companionHasPermission;
  }, [strategy, activeWallet?.address, isIncrease, userStrategy]);

  const buildSteps = React.useCallback(async () => {
    if (!asset || !assetAmountInUnits || assetAmountInUnits === '' || !activeWallet?.address || !strategy) {
      return [];
    }

    const allowance = await walletService.getSpecificAllowance(
      asset,
      PERMIT_2_ADDRESS[strategy.network.chainId],
      activeWallet?.address
    );

    const isApproved =
      allowance.allowance &&
      allowance.token.address === asset.address &&
      parseUnits(allowance.allowance, asset.decimals) >= parseUnits(assetAmountInUnits, asset.decimals);

    const assetAmount = parseUnits(assetAmountInUnits, asset.decimals);
    const newSteps: TransactionStep[] = [];

    if (!isIncrease && strategy?.tos) {
      newSteps.push({
        hash: '',
        chainId: strategy.network.chainId,
        onAction: onSignEarnToS,
        checkForPending: false,
        done: false,
        type: TRANSACTION_ACTION_SIGN_TOS_EARN,
        explanation: intl.formatMessage(
          defineMessage({
            description: 'earn.strategy-management.deposit.tx-steps.sign-tos',
            // TODO: Agregar un link aca
            defaultMessage: 'You need to sign the ToS of balmy to continue',
          })
        ),
        extraData: {
          tos: strategy.tos,
          signStatus: SignStatus.none,
        },
      });
    }

    if (!isApproved) {
      // Here we need to check if the token is from compound
      let allowsExactApproval = true;
      if (strategy.farm.name === 'Compound' && asset.address !== strategy.asset.address) {
        allowsExactApproval = false;
      }

      newSteps.push({
        hash: '',
        chainId: asset.chainId,
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
          allowsExactApproval: allowsExactApproval,
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

    if (asset.address !== PROTOCOL_TOKEN_ADDRESS) {
      newSteps.push({
        hash: '',
        chainId: asset.chainId,
        onAction: onSignPermit2Approval,
        checkForPending: false,
        done: false,
        type: TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_EARN,
        explanation: intl.formatMessage(
          defineMessage({
            description: 'earn.strategy-management.deposit.tx-steps.sign-permit2',
            defaultMessage: 'Balmy now needs your explicit authorization to deposit your {asset}',
          }),
          { asset: asset.symbol }
        ),
        extraData: {
          asset,
          assetAmount,
          signStatus: SignStatus.none,
        },
      });
    }

    if (requiresCompanionSignature) {
      newSteps.push({
        hash: '',
        chainId: asset.chainId,
        onAction: onSignCompanionApproval,
        checkForPending: false,
        done: false,
        type: TRANSACTION_ACTION_APPROVE_COMPANION_SIGN_EARN,
        explanation: intl.formatMessage(
          defineMessage({
            description: 'earn.strategy-management.increase.tx-steps.sign-companion-approval',
            defaultMessage: 'Balmy now needs your explicit authorization to increase your investment on {farm}',
          }),
          { farm: strategy.farm.name }
        ),
        extraData: {
          type: EarnPermission.INCREASE,
          signStatus: SignStatus.none,
        },
      });
    }

    newSteps.push({
      hash: '',
      chainId: asset.chainId,
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
  }, [
    isIncrease,
    requiresCompanionSignature,
    asset,
    assetAmountInUnits,
    intl,
    onApproveToken,
    onDeposit,
    onSignPermit2Approval,
    onApproveTransactionConfirmed,
    onSignEarnToS,
    strategy,
    activeWallet?.address,
  ]);

  const handleMultiSteps = React.useCallback(() => {
    if (!asset || assetAmountInUnits === '' || !assetAmountInUnits) {
      return;
    }

    // Scroll to top of page
    window.scrollTo(0, 0);
    buildSteps()
      .then((newSteps) => {
        trackEvent('Earn - Deposit - Start swap steps');
        setTransactionsToExecute(newSteps);
        setShouldShowSteps(true);
        return newSteps;
      })
      .catch((error) => {
        console.error('Error building steps', error);
      });
  }, [asset, assetAmountInUnits, buildSteps]);

  React.useEffect(() => {
    if (triggerSteps) {
      if (!asset || assetAmountInUnits === '' || !assetAmountInUnits) {
        return;
      }
      // hasTriggeredSteps.current = true;
      handleMultiSteps();
      dispatch(setTriggerSteps(false));
    }
  }, [triggerSteps, asset?.address, assetAmountInUnits, handleMultiSteps]);

  const currentTransactionStep = React.useMemo(() => {
    const foundStep = find(transactionsToExecute, { done: false });
    return foundStep?.type || null;
  }, [transactionsToExecute]);

  const transactionOnAction = React.useMemo(() => {
    switch (currentTransactionStep) {
      case TRANSACTION_ACTION_APPROVE_COMPANION_SIGN_EARN:
        return { onAction: onSignCompanionApproval };
      case TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_EARN:
        return { onAction: onSignPermit2Approval };
      case TRANSACTION_ACTION_SIGN_TOS_EARN:
        return { onAction: onSignEarnToS };
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

  const transactionType = React.useMemo(() => {
    if (!activeWallet?.address || !strategy || !strategy.userPositions) {
      return TransactionApplicationIdentifier.EARN_CREATE;
    }

    const userHasPosition = strategy.userPositions.find((position) => position.owner === activeWallet.address);

    return userHasPosition
      ? TransactionApplicationIdentifier.EARN_INCREASE
      : TransactionApplicationIdentifier.EARN_CREATE;
  }, [strategy?.userPositions, activeWallet?.address]);

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
      transactionType,
      requiresCompanionSignature,
      isIncrease,
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
      transactionType,
      requiresCompanionSignature,
      isIncrease,
    ]
  );
};

export default useEarnDepositActions;
