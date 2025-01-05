import React from 'react';
import { parseUnits, formatUnits, Address, Hash } from 'viem';
import styled from 'styled-components';
import {
  Token,
  YieldOptions,
  TransactionTypes,
  ApproveTokenExactTypeData,
  ApproveTokenTypeData,
  TransactionActionCreatePositionData,
  AllowanceType,
  SignStatus,
  TransactionActionApproveTokenSignDCAData,
  TransactionApplicationIdentifier,
} from '@types';
import { Typography, BackgroundPaper, ContainerBox, colors, CalendarMonthIcon } from 'ui-library';
import TokenPicker from '../token-picker';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import find from 'lodash/find';
import {
  POSSIBLE_ACTIONS,
  NETWORKS,
  LATEST_VERSION,
  MINIMUM_USD_RATE_FOR_YIELD,
  DEFAULT_MINIMUM_USD_RATE_FOR_YIELD,
  ONE_DAY,
  shouldEnableFrequency,
  ModeTypesIds,
  TRANSACTION_ACTION_APPROVE_TOKEN,
  TRANSACTION_ACTION_CREATE_POSITION,
  TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_DCA,
  PERMIT_2_ADDRESS,
} from '@constants';
import useTransactionModal from '@hooks/useTransactionModal';
import findIndex from 'lodash/findIndex';
import TransactionSteps, {
  TransactionAction,
  TransactionAction as TransactionStep,
} from '@common/components/transaction-steps';
import { emptyTokenWithAddress, parseUsdPrice } from '@common/utils/currency';
import { useTransaction, useTransactionAdder } from '@state/transactions/hooks';
import useAvailablePairs from '@hooks/useAvailablePairs';

import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from '@common/mocks/tokens';
import useWalletService from '@hooks/useWalletService';
import useContractService from '@hooks/useContractService';
import usePositionService from '@hooks/usePositionService';
import useRawUsdPrice from '@hooks/useUsdRawPrice';
import useErrorService from '@hooks/useErrorService';
import { deserializeError, shouldTrackError } from '@common/utils/errors';
import useAnalytics from '@hooks/useAnalytics';
import useReplaceHistory from '@hooks/useReplaceHistory';
import useLoadedAsSafeApp from '@hooks/useLoadedAsSafeApp';
import { useAppDispatch } from '@state/hooks';
import {
  setFromValue,
  setFrom,
  setFrequencyType,
  setTo,
  setModeType,
  setRate,
  setToYield,
  setFromYield,
  setFrequencyValue,
  resetDcaForm,
} from '@state/create-position/actions';
import { useCreatePositionState } from '@state/create-position/hooks';
import usePermit2Service from '@hooks/usePermit2Service';
import useSpecificAllowance from '@hooks/useSpecificAllowance';
import useDcaAllowanceTarget from '@hooks/useDcaAllowanceTarget';
import useSupportsSigning from '@hooks/useSupportsSigning';
import SwapFirstStep from '../step1';
import useActiveWallet from '@hooks/useActiveWallet';
import TransactionConfirmation from '@common/components/transaction-confirmation';
import { useThemeMode } from '@state/config/hooks';
import { AddPositionToCalendarButton } from '@common/components/add-position-to-calendar';

const StyledFrequentRecipient = styled(ContainerBox).attrs({ gap: 6, justifyContent: 'center', alignItems: 'center' })`
  margin-top: ${({ theme: { spacing } }) => spacing(6)};
`;

const StyledPaper = styled(BackgroundPaper)`
  position: relative;
  backdrop-filter: blur(2px);
`;

const sellMessage = <FormattedMessage description="You sell" defaultMessage="You sell" />;
const receiveMessage = <FormattedMessage description="You receive" defaultMessage="You receive" />;

interface SwapProps {
  currentNetwork: { chainId: number; name: string };
  yieldOptions: YieldOptions;
  isLoadingYieldOptions: boolean;
  handleChangeNetwork: (newChainId: number) => void;
}

const Swap = ({ currentNetwork, yieldOptions, isLoadingYieldOptions, handleChangeNetwork }: SwapProps) => {
  const { fromValue, frequencyType, frequencyValue, from, to, fromYield, toYield, modeType, rate } =
    useCreatePositionState();
  const containerRef = React.useRef(null);
  const [showFirstStep, setShowFirstStep] = React.useState(true);
  const [shouldShowPicker, setShouldShowPicker] = React.useState(false);
  const [selecting, setSelecting] = React.useState(from || emptyTokenWithAddress('from'));
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const walletService = useWalletService();
  const positionService = usePositionService();
  const dispatch = useAppDispatch();
  const contractService = useContractService();
  const availablePairs = useAvailablePairs(currentNetwork.chainId);
  const errorService = useErrorService();
  const { trackEvent } = useAnalytics();
  const permit2Service = usePermit2Service();
  const [shouldShowSteps, setShouldShowSteps] = React.useState(false);
  const [transactionsToExecute, setTransactionsToExecute] = React.useState<TransactionStep[]>([]);
  const [shouldShowConfirmation, setShouldShowConfirmation] = React.useState(false);
  const [currentTransaction, setCurrentTransaction] = React.useState<{ hash: Hash; chainId: number } | undefined>();
  const currentFullTransaction = useTransaction(currentTransaction);
  const intl = useIntl();
  const canUsePermit2 = useSupportsSigning();
  const allowanceTarget = useDcaAllowanceTarget(currentNetwork.chainId, from, fromYield?.tokenAddress, canUsePermit2);
  const activeWallet = useActiveWallet();
  const themeMode = useThemeMode();
  const [allowance, , allowanceErrors] = useSpecificAllowance(from, activeWallet?.address || '', allowanceTarget);

  const existingPair = React.useMemo(() => {
    if (!from || !to) return undefined;
    let tokenA = fromYield?.tokenAddress || from.address;
    let tokenB = toYield?.tokenAddress || to.address;

    if (tokenA === PROTOCOL_TOKEN_ADDRESS) {
      tokenA = getWrappedProtocolToken(currentNetwork.chainId).address;
    }
    if (tokenB === PROTOCOL_TOKEN_ADDRESS) {
      tokenB = getWrappedProtocolToken(currentNetwork.chainId).address;
    }

    const token0 = tokenA < tokenB ? tokenA : tokenB;
    const token1 = tokenA < tokenB ? tokenB : tokenA;

    return find(
      availablePairs,
      (pair) => pair.token0 === token0.toLocaleLowerCase() && pair.token1 === token1.toLocaleLowerCase()
    );
  }, [from, to, availablePairs, (availablePairs && availablePairs.length) || 0, fromYield, toYield]);
  const loadedAsSafeApp = useLoadedAsSafeApp();

  const [usdPrice, isLoadingUsdPrice] = useRawUsdPrice(from);

  const replaceHistory = useReplaceHistory();

  const fromCanHaveYield = !!(
    from && yieldOptions.filter((yieldOption) => yieldOption.enabledTokens.includes(from.address)).length
  );
  const toCanHaveYield = !!(
    to && yieldOptions.filter((yieldOption) => yieldOption.enabledTokens.includes(to.address)).length
  );

  const isApproved =
    !from ||
    (from &&
      (!fromValue
        ? true
        : (allowance.allowance &&
            allowance.token.address === from.address &&
            parseUnits(allowance.allowance, from.decimals) >= parseUnits(fromValue, from.decimals)) ||
          from.address === PROTOCOL_TOKEN_ADDRESS));

  React.useEffect(() => {
    if (!from) return;
    dispatch(
      setRate(
        (fromValue &&
          parseUnits(fromValue, from.decimals) > 0n &&
          frequencyValue &&
          BigInt(frequencyValue) > 0n &&
          from &&
          formatUnits(parseUnits(fromValue, from.decimals) / BigInt(frequencyValue), from.decimals)) ||
          '0'
      )
    );
  }, [from]);

  let rateForUsdPrice: bigint | null = null;

  try {
    rateForUsdPrice = (rate !== '' && parseUnits(rate, from?.decimals || 18)) || null;
    // eslint-disable-next-line no-empty
  } catch {}

  const rateUsdPrice = parseUsdPrice(from, rateForUsdPrice, usdPrice);

  const hasEnoughUsdForYield =
    !!usdPrice &&
    rateUsdPrice >= (MINIMUM_USD_RATE_FOR_YIELD[currentNetwork.chainId] || DEFAULT_MINIMUM_USD_RATE_FOR_YIELD);

  // only allowed if set for 10 days and at least 10 USD
  const shouldEnableYield = (fromCanHaveYield || toCanHaveYield) && hasEnoughUsdForYield;

  const onSetFrom = (newFrom: Token) => {
    // check for decimals
    if (from && newFrom.decimals < from.decimals) {
      const splitValue = /^(\d*)\.?(\d*)$/.exec(fromValue);
      let newFromValue = fromValue;
      if (splitValue && splitValue[2] !== '') {
        newFromValue = `${splitValue[1]}.${splitValue[2].substring(0, newFrom.decimals)}`;
      }

      dispatch(setFromValue(newFromValue));
    }

    dispatch(setFrom(newFrom));

    if (!shouldEnableFrequency(frequencyType.toString(), newFrom.address, to?.address, currentNetwork.chainId)) {
      dispatch(setFrequencyType(ONE_DAY));
    }

    replaceHistory(`/invest/create/${currentNetwork.chainId}/${newFrom.address}/${to?.address || ''}`);
    trackEvent('DCA - Set from', { fromAddress: newFrom?.address, toAddress: to?.address });
  };
  const onSetTo = (newTo: Token) => {
    dispatch(setTo(newTo));
    if (!shouldEnableFrequency(frequencyType.toString(), from?.address, newTo.address, currentNetwork.chainId)) {
      dispatch(setFrequencyType(ONE_DAY));
    }
    if (from) {
      replaceHistory(`/invest/create/${currentNetwork.chainId}/${from.address || ''}/${newTo.address}`);
    }
    trackEvent('DCA - Set to', { fromAddress: from?.address, toAddress: newTo?.address });
  };

  const handleApproveToken = async (amount?: bigint) => {
    if (!from || !to || !activeWallet?.address) return;
    const fromSymbol = from.symbol;

    try {
      setModalLoading({
        content: (
          <Typography variant="bodyRegular">
            <FormattedMessage
              description="approving token"
              defaultMessage="Approving use of {from}"
              values={{ from: fromSymbol || '' }}
            />
          </Typography>
        ),
      });
      trackEvent('DCA - Approve token submitting');
      const addressToApprove = PERMIT_2_ADDRESS[currentNetwork.chainId] || PERMIT_2_ADDRESS[NETWORKS.mainnet.chainId];

      const result = await walletService.approveSpecificToken(from, addressToApprove, activeWallet.address, amount);

      trackEvent('DCA - Approve token submitted');

      const transactionTypeDataBase = {
        token: from,
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
            chainId: result.chainId,
          };
        }

        setTransactionsToExecute(newSteps);
      }
    } catch (e) {
      // User rejecting transaction
      // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (shouldTrackError(e as Error)) {
        trackEvent('DCA - Approve token error');
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error approving token', JSON.stringify(e), {
          from: from.address,
          to: to.address,
          chainId: currentNetwork.chainId,
        });
      }
      setModalError({
        content: <FormattedMessage description="modalErrorApprove" defaultMessage="Error approving token" />,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        error: {
          ...deserializeError(e),
          extraData: {
            from: from.address,
            to: to.address,
            chainId: currentNetwork.chainId,
          },
        },
      });
    }
  };

  const handleSwap = async () => {
    if (!from || !to || !activeWallet?.address) return;

    const hubAddress = contractService.getHUBAddress(currentNetwork.chainId);
    const companionAddress = contractService.getHUBCompanionAddress(currentNetwork.chainId);
    if (!hubAddress || !companionAddress) return;

    const fromSymbol = from.symbol;

    try {
      setModalLoading({
        content: (
          <Typography variant="bodyRegular">
            <FormattedMessage
              description="creating position"
              defaultMessage="Creating a position to swap {from} to {to}"
              values={{ from: fromSymbol || '', to: (to && to.symbol) || '' }}
            />
          </Typography>
        ),
      });

      let signature;

      if (transactionsToExecute?.length) {
        const index = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_CREATE_POSITION });

        if (index !== -1) {
          signature = (transactionsToExecute[index].extraData as TransactionActionCreatePositionData).signature;
        }
      }

      trackEvent('DCA - Create position submitting');
      const result = await positionService.deposit(
        activeWallet.address,
        from,
        to,
        fromValue,
        frequencyType,
        frequencyValue,
        currentNetwork.chainId,
        shouldEnableYield ? fromYield?.tokenAddress : undefined,
        shouldEnableYield ? toYield?.tokenAddress : undefined,
        signature
      );
      try {
        trackEvent('DCA - Create position submitted', {
          from: from.symbol,
          to: to.symbol,
          fromValue,
          frequencyType,
          frequencyValue,
          yieldFrom: fromYield?.name,
          yieldTo: toYield?.name,
          fromUsdValue: parseUsdPrice(from, parseUnits(fromValue, from.decimals), usdPrice),
        });
      } catch {}

      addTransaction(result, {
        type: TransactionTypes.newPosition,
        typeData: {
          from,
          to,
          fromYield: shouldEnableYield ? fromYield?.tokenAddress : undefined,
          toYield: shouldEnableYield ? toYield?.tokenAddress : undefined,
          fromValue,
          frequencyType: frequencyType.toString(),
          frequencyValue,
          startedAt: Math.floor(Date.now() / 1000),
          id: result.hash,
          isCreatingPair: !existingPair,
          version: LATEST_VERSION,
          addressFor:
            to.address === PROTOCOL_TOKEN_ADDRESS || from.address === PROTOCOL_TOKEN_ADDRESS
              ? companionAddress
              : hubAddress,
          yields: {
            from: fromYield ?? undefined,
            to: toYield ?? undefined,
          },
        },
      });

      setModalClosed({ content: '' });

      if (transactionsToExecute?.length) {
        const newSteps = [...transactionsToExecute];

        const index = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_CREATE_POSITION });

        if (index !== -1) {
          newSteps[index] = {
            ...newSteps[index],
            hash: result.hash,
            chainId: result.chainId,
            done: true,
          };

          setTransactionsToExecute(newSteps);
        }
      }

      setShowFirstStep(false);
      setShouldShowConfirmation(true);
      setShouldShowSteps(false);
      setCurrentTransaction({
        hash: result.hash,
        chainId: result.chainId,
      });
      dispatch(setFromValue(''));
      dispatch(setRate('0'));
      dispatch(setToYield({ option: null, manualUpdate: false }));
      dispatch(setFromYield({ option: null, manualUpdate: false }));

      window.scrollTo(0, 0);
    } catch (e) {
      // User rejecting transaction
      if (shouldTrackError(e as Error)) {
        trackEvent('DCA - Create position error');
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error creating position', JSON.stringify(e), {
          from: from.address,
          to: to.address,
          chainId: currentNetwork.chainId,
        });
      }

      let signature;
      let signatureData;

      if (transactionsToExecute?.length) {
        const index = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_CREATE_POSITION });

        if (index !== -1) {
          signature = (transactionsToExecute[index].extraData as TransactionActionCreatePositionData).signature;
          signatureData = await permit2Service.getPermit2DcaSignatureInfo(
            activeWallet.address,
            from,
            parseUnits(fromValue, from.decimals)
          );
        }
      }

      setModalError({
        content: <FormattedMessage description="modalErrorCreatingPosition" defaultMessage="Error creating position" />,
        /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        error: {
          ...deserializeError(e),
          extraData: {
            from: from.address,
            to: to.address,
            chainId: currentNetwork.chainId,
            signature,
            signatureData,
          },
        },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const handleSafeApproveAndSwap = async () => {
    if (!from || !to || !loadedAsSafeApp || !activeWallet?.address) return;

    const hubAddress = contractService.getHUBAddress(currentNetwork.chainId);
    const companionAddress = contractService.getHUBCompanionAddress(currentNetwork.chainId);
    if (!hubAddress || !companionAddress) return;

    const fromSymbol = from.symbol;

    try {
      setModalLoading({
        content: (
          <Typography variant="bodyRegular">
            <FormattedMessage
              description="creating position"
              defaultMessage="Creating a position to swap {from} to {to}"
              values={{ from: fromSymbol || '', to: (to && to.symbol) || '' }}
            />
          </Typography>
        ),
      });
      trackEvent('DCA - Safe approve and create position submitting');
      const result = await positionService.approveAndDepositSafe(
        activeWallet?.address,
        from,
        to,
        fromValue,
        frequencyType,
        frequencyValue,
        currentNetwork.chainId,
        shouldEnableYield ? fromYield?.tokenAddress : undefined,
        shouldEnableYield ? toYield?.tokenAddress : undefined
      );
      trackEvent('DCA - Safe approve and create position submitted');

      addTransaction(
        {
          hash: result.safeTxHash as Address,
          from: activeWallet.address,
          chainId: currentNetwork.chainId,
        },
        {
          type: TransactionTypes.newPosition,
          typeData: {
            from,
            to,
            fromYield: shouldEnableYield ? fromYield?.tokenAddress : undefined,
            toYield: shouldEnableYield ? toYield?.tokenAddress : undefined,
            fromValue,
            frequencyType: frequencyType.toString(),
            frequencyValue,
            startedAt: Math.floor(Date.now() / 1000),
            id: result.safeTxHash,
            isCreatingPair: !existingPair,
            version: LATEST_VERSION,
            addressFor:
              to.address === PROTOCOL_TOKEN_ADDRESS || from.address === PROTOCOL_TOKEN_ADDRESS
                ? companionAddress
                : hubAddress,
            yields: {
              from: fromYield ?? undefined,
              to: toYield ?? undefined,
            },
          },
        }
      );
      setModalClosed({ content: '' });

      setShowFirstStep(false);
      setShouldShowConfirmation(true);
      setShouldShowSteps(false);
      setCurrentTransaction({
        hash: result.safeTxHash as Hash,
        chainId: currentNetwork.chainId,
      });
      dispatch(setFromValue(''));
      dispatch(setRate('0'));
      dispatch(setToYield({ option: null, manualUpdate: false }));
      dispatch(setFromYield({ option: null, manualUpdate: false }));
    } catch (e) {
      // User rejecting transaction
      if (shouldTrackError(e as Error)) {
        trackEvent('DCA - Safe approve and create position error');
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error creating position', JSON.stringify(e), {
          from: from.address,
          to: to.address,
          chainId: currentNetwork.chainId,
        });
      }
      setModalError({
        content: <FormattedMessage description="modalErrorCreatingPosition" defaultMessage="Error creating position" />,
        /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        error: {
          ...deserializeError(e),
          extraData: {
            from: from.address,
            to: to.address,
            chainId: currentNetwork.chainId,
          },
        },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const handleApproveTransactionConfirmed = (hash: string) => {
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
  };

  const handlePermit2Signed = (transactions?: TransactionStep[]) => {
    if (!transactions?.length) {
      return Promise.resolve(null);
    }

    const newSteps = [...transactions];

    const signIndex = findIndex(transactions, { type: TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_DCA });

    if (signIndex !== -1) {
      newSteps[signIndex] = {
        ...newSteps[signIndex],
        done: true,
        checkForPending: false,
      };

      setTransactionsToExecute(newSteps);
    }

    return null;
  };

  const handleSignPermit2Approval = async () => {
    if (!from || !to || !fromValue || !activeWallet?.address) return;
    const amount = parseUnits(fromValue, from.decimals);

    try {
      trackEvent('DCA - Sign permi2Approval submitting', {
        fromSteps: !!transactionsToExecute?.length,
      });
      const result = await permit2Service.getPermit2DcaSignedData(
        activeWallet.address,
        currentNetwork.chainId,
        from,
        amount
      );
      trackEvent('DCA - Sign permi2Approval submitting', {
        fromSteps: !!transactionsToExecute?.length,
      });

      if (transactionsToExecute?.length) {
        const newSteps = [...transactionsToExecute];

        const approveIndex = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_DCA });

        if (approveIndex !== -1) {
          newSteps[approveIndex] = {
            ...newSteps[approveIndex],
            extraData: {
              ...(newSteps[approveIndex].extraData as unknown as TransactionActionApproveTokenSignDCAData),
              signStatus: SignStatus.signed,
            },
          } as TransactionAction;
        }

        const swapIndex = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_CREATE_POSITION });

        if (swapIndex !== -1) {
          newSteps[swapIndex] = {
            ...newSteps[swapIndex],
            extraData: {
              ...(newSteps[swapIndex].extraData as unknown as TransactionActionCreatePositionData),
              signature: result,
            },
          } as TransactionAction;
        }

        setTransactionsToExecute(newSteps);

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        handlePermit2Signed(newSteps);
      }
    } catch (e) {
      if (shouldTrackError(e as Error)) {
        trackEvent('DCA - Sign permi2Approval error', {
          fromSteps: !!transactionsToExecute?.length,
        });
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error signing permi2Approval DCA', JSON.stringify(e), {
          chainId: currentNetwork.chainId,
          from: from.address,
          to: to.address,
        });
      }

      if (transactionsToExecute?.length) {
        const newSteps = [...transactionsToExecute];

        const approveIndex = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_DCA });

        if (approveIndex !== -1) {
          newSteps[approveIndex] = {
            ...newSteps[approveIndex],
            extraData: {
              ...(newSteps[approveIndex].extraData as unknown as TransactionActionApproveTokenSignDCAData),
              signStatus: SignStatus.failed,
            },
          } as TransactionAction;
        }

        setTransactionsToExecute(newSteps);
      }
    }
  };

  const handleBackTransactionSteps = () => {
    setShowFirstStep(true);
    setShouldShowSteps(false);
  };

  const startSelectingCoin = (token: Token) => {
    setSelecting(token);
    setShouldShowPicker(true);
    trackEvent('DCA - start selecting coin', {
      selected: token.address,
      is: selecting.address === from?.address ? 'from' : 'to',
    });
  };

  const handleFromValueChange = (newFromValue: string) => {
    if (!from) return;
    dispatch(setModeType(ModeTypesIds.FULL_DEPOSIT_TYPE));
    dispatch(setFromValue(newFromValue));
    dispatch(
      setRate(
        (newFromValue &&
          parseUnits(newFromValue, from.decimals) > 0n &&
          frequencyValue &&
          BigInt(frequencyValue) > 0n &&
          formatUnits(parseUnits(newFromValue, from.decimals) / BigInt(frequencyValue), from.decimals)) ||
          '0'
      )
    );
  };

  const handleFrequencyChange = (newFrequencyValue: string) => {
    dispatch(setFrequencyValue(newFrequencyValue));
    trackEvent('DCA - Set frequency value', {});
    if (modeType === ModeTypesIds.RATE_TYPE) {
      dispatch(
        setFromValue(
          (from &&
            rate &&
            parseUnits(rate, from.decimals) > 0n &&
            newFrequencyValue &&
            BigInt(newFrequencyValue) > 0n &&
            formatUnits(parseUnits(rate, from.decimals) * BigInt(newFrequencyValue), from.decimals)) ||
            ''
        )
      );
    } else {
      dispatch(
        setRate(
          (from &&
            fromValue &&
            parseUnits(fromValue, from.decimals) > 0n &&
            newFrequencyValue &&
            BigInt(newFrequencyValue) > 0n &&
            formatUnits(parseUnits(fromValue, from.decimals) / BigInt(newFrequencyValue), from.decimals)) ||
            '0'
        )
      );
    }
  };

  const buildSteps = () => {
    if (!from || fromValue === '' || !to) {
      return [];
    }

    const newSteps: TransactionStep[] = [];

    const amountToApprove = parseUnits(fromValue, from.decimals);

    if (!isApproved) {
      newSteps.push({
        hash: '',
        chainId: currentNetwork.chainId,
        onAction: (amount) => handleApproveToken(amount),
        checkForPending: false,
        done: false,
        type: TRANSACTION_ACTION_APPROVE_TOKEN,
        explanation: intl.formatMessage(
          defineMessage({
            description: 'approveTokenExplanation',
            defaultMessage:
              'By enabling Universal Approval, you will be able to use Uniswap, Mean, swap aggregators and more protocols without having to authorize each one of them',
          })
        ),
        extraData: {
          token: from,
          amount: amountToApprove,
          swapper: intl.formatMessage(
            defineMessage({
              description: 'us',
              defaultMessage: 'us',
            })
          ),
          isPermit2Enabled: true,
          defaultApproval: AllowanceType.max,
          help: intl.formatMessage(
            defineMessage({
              description: 'Allowance Tooltip',
              defaultMessage: 'You must give the {target} smart contracts permission to use your {symbol}',
            }),
            { target: 'Universal Approval' }
          ),
        },
      });
    }

    newSteps.push({
      hash: '',
      chainId: currentNetwork.chainId,
      onAction: handleSignPermit2Approval,
      checkForPending: false,
      done: false,
      type: TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_DCA,
      explanation: intl.formatMessage(
        defineMessage({
          description: 'permit2SignExplanation',
          defaultMessage:
            'Mean now needs your explicit authorization to move {value} {tokenFrom} in order to create your position',
        }),
        { tokenFrom: from.symbol, value: fromValue }
      ),
      extraData: {
        signStatus: SignStatus.none,
      },
    });

    newSteps.push({
      hash: '',
      chainId: currentNetwork.chainId,
      onAction: handleSwap,
      checkForPending: true,
      done: false,
      type: TRANSACTION_ACTION_CREATE_POSITION,
      extraData: {
        from,
        to,
        fromValue,
        frequencyType,
        frequencyValue,
      },
    });

    return newSteps;
  };

  const handleMultiSteps = () => {
    if (!from || fromValue === '' || !to) {
      return;
    }

    const newSteps = buildSteps();
    window.scrollTo(0, 0);

    trackEvent('DCA - Start create steps');
    setTransactionsToExecute(newSteps);
    setShouldShowSteps(true);
  };

  const currentTransactionStep = React.useMemo(() => {
    const foundStep = find(transactionsToExecute, { done: false });
    return foundStep?.type || null;
  }, [transactionsToExecute]);

  const transactionOnAction = React.useMemo(() => {
    switch (currentTransactionStep) {
      case TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_DCA:
        return { onAction: handleSignPermit2Approval };
      case TRANSACTION_ACTION_APPROVE_TOKEN:
        return { onAction: handleApproveToken, onActionConfirmed: handleApproveTransactionConfirmed };
      case TRANSACTION_ACTION_CREATE_POSITION:
        return { onAction: handleSwap };
      default:
        return { onAction: () => {} };
    }
  }, [currentTransactionStep]);

  const preHandleSwap = () => {
    if (!from || !to) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handleSwap();
  };

  const preHandleSafeApproveAndSwap = () => {
    if (!from || !to) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    handleSafeApproveAndSwap();
  };

  const PRE_POSSIBLE_ACTIONS_FUNCTIONS = {
    createPosition: preHandleSwap,
    safeApproveAndCreatePosition: preHandleSafeApproveAndSwap,
    approveAndCreatePosition: handleMultiSteps,
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  const onButtonClick = async (actionToDo: keyof typeof POSSIBLE_ACTIONS) => {
    if (PRE_POSSIBLE_ACTIONS_FUNCTIONS[actionToDo]) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      PRE_POSSIBLE_ACTIONS_FUNCTIONS[actionToDo]();

      if (actionToDo === 'createPosition') {
        trackEvent('DCA - Create position', { fromAddress: from?.address, toAddress: to?.address });
      }
    }
  };

  const tokenPickerModalTitle = selecting === from ? sellMessage : receiveMessage;

  const handleNewPosition = () => {
    trackEvent('DCA - Transaction steps - New position');
    setShouldShowConfirmation(false);
    dispatch(resetDcaForm());
    setShowFirstStep(true);
  };

  return (
    <>
      <StyledPaper variant="outlined" ref={containerRef}>
        <TransactionSteps
          shouldShow={shouldShowSteps}
          handleClose={handleBackTransactionSteps}
          transactions={transactionsToExecute}
          onAction={transactionOnAction.onAction}
          onActionConfirmed={transactionOnAction.onActionConfirmed}
          setShouldShowFirstStep={setShowFirstStep}
          applicationIdentifier={TransactionApplicationIdentifier.DCA}
        />
        <TransactionConfirmation
          shouldShow={shouldShowConfirmation}
          transaction={currentTransaction}
          showWalletBalanceChanges={false}
          successSubtitle={
            <FormattedMessage
              description="positionCreationSuccessfulDescription"
              defaultMessage="Your <b>{from}-{to}</b> position was created"
              values={{
                from: from?.symbol || '',
                to: to?.symbol || '',
                b: (chunks) => <b>{chunks}</b>,
              }}
            />
          }
          successTitle={
            <FormattedMessage
              description="transactionConfirmationPositionCreationSuccessful"
              defaultMessage="Position creation successful"
            />
          }
          loadingTitle={intl.formatMessage(
            defineMessage({
              description: 'transactionConfirmationDcaLoadingTitle',
              defaultMessage: 'Creating position...',
            })
          )}
          loadingSubtitle={intl.formatMessage(
            defineMessage({
              description: 'transactionConfirmationDcaLoadingSubTitle',
              defaultMessage: 'You are creating a {from}-{to} DCA position',
            }),
            {
              from: from?.symbol || '',
              to: to?.symbol || '',
            }
          )}
          actions={[
            {
              variant: 'contained',
              color: 'primary',
              onAction: handleNewPosition,
              label: intl.formatMessage({
                description: 'transactionDCAConfirmationNewPosition',
                defaultMessage: 'Create new position',
              }),
            },
          ]}
          txIdentifierForSatisfaction={TransactionApplicationIdentifier.DCA}
        />
        <TokenPicker
          shouldShow={shouldShowPicker}
          onClose={() => setShouldShowPicker(false)}
          modalTitle={tokenPickerModalTitle}
          onChange={
            (from && selecting.address === from.address) || selecting.address === ('from' as Address)
              ? onSetFrom
              : onSetTo
          }
          yieldOptions={yieldOptions}
          otherSelected={
            (from && selecting.address === from.address) || selecting.address === ('from' as Address) ? to : from
          }
        />
        {showFirstStep && (
          <SwapFirstStep
            startSelectingCoin={startSelectingCoin}
            handleFrequencyChange={handleFrequencyChange}
            onChangeNetwork={handleChangeNetwork}
            handleFromValueChange={handleFromValueChange}
            rateUsdPrice={rateUsdPrice}
            yieldEnabled={shouldEnableYield}
            fromCanHaveYield={fromCanHaveYield}
            toCanHaveYield={toCanHaveYield}
            yieldOptions={yieldOptions}
            isLoadingYieldOptions={isLoadingYieldOptions}
            usdPrice={usdPrice}
            onButtonClick={onButtonClick}
            isApproved={isApproved}
            isLoadingUsdPrice={isLoadingUsdPrice}
            allowanceErrors={allowanceErrors}
            existingPair={existingPair}
            currentNetwork={currentNetwork}
          />
        )}
      </StyledPaper>
      {shouldShowConfirmation && !!currentFullTransaction?.receipt && (
        <StyledFrequentRecipient>
          <ContainerBox gap={1} alignItems="center" color={colors[themeMode].typography.typo2}>
            <CalendarMonthIcon />
            <ContainerBox flexDirection="column">
              <Typography variant="bodySmallBold">
                <FormattedMessage description="DcaAddToCalendarReminder" defaultMessage="Need a reminder?" />
              </Typography>
              <Typography variant="bodySmallRegular">
                <FormattedMessage
                  description="DcaAddToCalendarReminderDescription"
                  defaultMessage="Add your position finishing date on your calendar."
                />
              </Typography>
            </ContainerBox>
          </ContainerBox>
          <AddPositionToCalendarButton
            position={{
              from,
              to,
              chainId: currentNetwork.chainId,
              remainingSwaps: BigInt(frequencyValue || 0),
              swapInterval: frequencyType,
              version: LATEST_VERSION,
              positionId:
                (currentFullTransaction?.type === TransactionTypes.newPosition &&
                  BigInt(currentFullTransaction.typeData.id || 0)) ||
                undefined,
            }}
          />
        </StyledFrequentRecipient>
      )}
    </>
  );
};
export default Swap;
