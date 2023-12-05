import React from 'react';
import { parseUnits, formatUnits } from '@ethersproject/units';
import styled from 'styled-components';
import {
  Token,
  YieldOptions,
  TransactionTypes,
  ApproveTokenExactTypeData,
  ApproveTokenTypeData,
  TransactionActionCreatePositionData,
  AllowanceType,
} from '@types';
import { Typography, Grid, Slide, Paper } from 'ui-library';
import TokenPickerModal from '@common/components/token-picker-modal';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import find from 'lodash/find';
import { useTokenBalance } from '@state/balances/hooks';
import StalePairModal from '@pages/dca/components/stale-pair-modal';
import {
  POSSIBLE_ACTIONS,
  WHALE_MODE_FREQUENCIES,
  NETWORKS,
  LATEST_VERSION,
  MINIMUM_USD_RATE_FOR_YIELD,
  DEFAULT_MINIMUM_USD_RATE_FOR_YIELD,
  ONE_DAY,
  shouldEnableFrequency,
  ModeTypesIds,
  TRANSACTION_ACTION_APPROVE_TOKEN,
  TRANSACTION_ACTION_WAIT_FOR_APPROVAL,
  TRANSACTION_ACTION_CREATE_POSITION,
  TRANSACTION_ACTION_APPROVE_TOKEN_SIGN,
  PERMIT_2_ADDRESS,
} from '@constants';
import useTransactionModal from '@hooks/useTransactionModal';
import findIndex from 'lodash/findIndex';
import TransactionSteps, {
  TransactionAction,
  TransactionAction as TransactionStep,
} from '@common/components/transaction-steps';
import { emptyTokenWithAddress, parseUsdPrice } from '@common/utils/currency';
import { useTransactionAdder } from '@state/transactions/hooks';
import { calculateStale, STALE } from '@common/utils/parsing';
import useAvailablePairs from '@hooks/useAvailablePairs';
import { BigNumber } from 'ethers';
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from '@common/mocks/tokens';
import useWalletService from '@hooks/useWalletService';
import useContractService from '@hooks/useContractService';
import usePositionService from '@hooks/usePositionService';
import useRawUsdPrice from '@hooks/useUsdRawPrice';
import useErrorService from '@hooks/useErrorService';
import { shouldTrackError } from '@common/utils/errors';
import useTrackEvent from '@hooks/useTrackEvent';
import useReplaceHistory from '@hooks/useReplaceHistory';
import useLoadedAsSafeApp from '@hooks/useLoadedAsSafeApp';
import { TransactionResponse } from '@ethersproject/providers';
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
} from '@state/create-position/actions';
import { useCreatePositionState } from '@state/create-position/hooks';
import usePermit2Service from '@hooks/usePermit2Service';
import useSpecificAllowance from '@hooks/useSpecificAllowance';
import useDcaAllowanceTarget from '@hooks/useDcaAllowanceTarget';
import useSupportsSigning from '@hooks/useSupportsSigning';
import SwapFirstStep from '../step1';
import SwapSecondStep from '../step2';
import DcaButton from '../dca-button';
import NextSwapAvailable from '../next-swap-available';
import PositionConfirmation from '../position-confirmation';
import useActiveWallet from '@hooks/useActiveWallet';

export const StyledContentContainer = styled.div`
  background-color: #292929;
  padding: 16px;
  border-radius: 8px;
`;

const StyledPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  background-color: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(6px);
`;

export const StyledGrid = styled(Grid)<{ $show: boolean; $zIndex: number }>`
  ${({ $show }) => !$show && 'position: absolute;width: auto;'};
  ${({ $zIndex }) => `z-index: ${$zIndex};`}
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 90;
`;

const sellMessage = <FormattedMessage description="You sell" defaultMessage="You sell" />;
const receiveMessage = <FormattedMessage description="You receive" defaultMessage="You receive" />;

interface AvailableSwapInterval {
  label: {
    singular: string;
    adverb: string;
  };
  value: BigNumber;
}

interface SwapProps {
  currentNetwork: { chainId: number; name: string };
  availableFrequencies: AvailableSwapInterval[];
  yieldOptions: YieldOptions;
  isLoadingYieldOptions: boolean;
  handleChangeNetwork: (newChainId: number) => void;
}

const Swap = ({
  currentNetwork,
  availableFrequencies,
  yieldOptions,
  isLoadingYieldOptions,
  handleChangeNetwork,
}: SwapProps) => {
  const { fromValue, frequencyType, frequencyValue, from, to, yieldEnabled, fromYield, toYield, modeType, rate } =
    useCreatePositionState();
  const containerRef = React.useRef(null);
  const [createStep, setCreateStep] = React.useState<0 | 1>(0);
  const [showFirstStep, setShowFirstStep] = React.useState(false);
  const [showSecondStep, setShowSecondStep] = React.useState(false);
  const [isRender, setIsRender] = React.useState(true);
  const [shouldShowPicker, setShouldShowPicker] = React.useState(false);
  const [selecting, setSelecting] = React.useState(from || emptyTokenWithAddress('from'));
  const [shouldShowStalePairModal, setShouldShowStalePairModal] = React.useState(false);
  const [currentAction, setCurrentAction] = React.useState<keyof typeof POSSIBLE_ACTIONS>('createPosition');
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const walletService = useWalletService();
  const positionService = usePositionService();
  const dispatch = useAppDispatch();
  const contractService = useContractService();
  const availablePairs = useAvailablePairs();
  const errorService = useErrorService();
  const trackEvent = useTrackEvent();
  const permit2Service = usePermit2Service();
  const [shouldShowSteps, setShouldShowSteps] = React.useState(false);
  const [transactionsToExecute, setTransactionsToExecute] = React.useState<TransactionStep[]>([]);
  const [shouldShowConfirmation, setShouldShowConfirmation] = React.useState(false);
  const [currentTransaction, setCurrentTransaction] = React.useState('');
  const intl = useIntl();
  const canUsePermit2 = useSupportsSigning();
  const allowanceTarget = useDcaAllowanceTarget(currentNetwork.chainId, from, fromYield?.tokenAddress, canUsePermit2);
  const activeWallet = useActiveWallet();
  const { balance } = useTokenBalance({ token: from, walletAddress: activeWallet?.address, shouldAutoFetch: true });
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
      (pair) => pair.token0.address === token0.toLocaleLowerCase() && pair.token1.address === token1.toLocaleLowerCase()
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

  const fromValueUsdPrice = parseUsdPrice(
    from,
    (fromValue !== '' && parseUnits(fromValue, from?.decimals)) || null,
    usdPrice
  );

  const isApproved =
    !from ||
    (from &&
      (!fromValue
        ? true
        : (allowance.allowance &&
            allowance.token.address === from.address &&
            parseUnits(allowance.allowance, from.decimals).gte(parseUnits(fromValue, from.decimals))) ||
          from.address === PROTOCOL_TOKEN_ADDRESS));

  React.useEffect(() => {
    if (!from) return;
    dispatch(
      setRate(
        (fromValue &&
          parseUnits(fromValue, from.decimals).gt(BigNumber.from(0)) &&
          frequencyValue &&
          BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
          from &&
          formatUnits(parseUnits(fromValue, from.decimals).div(BigNumber.from(frequencyValue)), from.decimals)) ||
          '0'
      )
    );
  }, [from]);

  let rateForUsdPrice: BigNumber | null = null;

  try {
    rateForUsdPrice = (rate !== '' && parseUnits(rate, from?.decimals)) || null;
    // eslint-disable-next-line no-empty
  } catch {}

  const rateUsdPrice = parseUsdPrice(from, rateForUsdPrice, usdPrice);

  const hasEnoughUsdForYield =
    !!usdPrice &&
    rateUsdPrice >= (MINIMUM_USD_RATE_FOR_YIELD[currentNetwork.chainId] || DEFAULT_MINIMUM_USD_RATE_FOR_YIELD);

  // only allowed if set for 10 days and at least 10 USD
  const shouldEnableYield = yieldEnabled && (fromCanHaveYield || toCanHaveYield) && hasEnoughUsdForYield;

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

    replaceHistory(`/create/${currentNetwork.chainId}/${newFrom.address}/${to?.address || ''}`);
    trackEvent('DCA - Set from', { fromAddress: newFrom?.address, toAddress: to?.address });
  };
  const onSetTo = (newTo: Token) => {
    dispatch(setTo(newTo));
    if (!shouldEnableFrequency(frequencyType.toString(), from?.address, newTo.address, currentNetwork.chainId)) {
      dispatch(setFrequencyType(ONE_DAY));
    }
    if (from) {
      replaceHistory(`/create/${currentNetwork.chainId}/${from.address || ''}/${newTo.address}`);
    }
    trackEvent('DCA - Set to', { fromAddress: from?.address, toAddress: newTo?.address });
  };

  const handleApproveToken = async (amount?: BigNumber) => {
    if (!from || !to || !activeWallet?.address) return;
    const fromSymbol = from.symbol;

    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="approving token"
              defaultMessage="Approving use of {from}"
              values={{ from: fromSymbol || '' }}
            />
          </Typography>
        ),
      });
      trackEvent('DCA - Approve token submitting');
      const addressToApprove = PERMIT_2_ADDRESS[currentNetwork.chainId] || PERMIT_2_ADDRESS[NETWORKS.ethereum.chainId];

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
          };

          const waitIndex = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_WAIT_FOR_APPROVAL });
          if (waitIndex !== -1) {
            newSteps[waitIndex] = {
              ...newSteps[waitIndex],
              hash: result.hash,
            };
          }
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
        error: { code: e.code, message: e.message, data: e.data },
      });
    }
  };

  const handleSwap = async () => {
    if (!from || !to || !activeWallet?.address) return;
    setShouldShowStalePairModal(false);
    const fromSymbol = from.symbol;

    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
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
      trackEvent('DCA - Create position submitted');
      const hubAddress = contractService.getHUBAddress(currentNetwork.chainId);
      const companionAddress = contractService.getHUBCompanionAddress(currentNetwork.chainId);

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
          startedAt: Date.now(),
          id: result.hash,
          isCreatingPair: !existingPair,
          version: LATEST_VERSION,
          addressFor:
            to.address === PROTOCOL_TOKEN_ADDRESS || from.address === PROTOCOL_TOKEN_ADDRESS
              ? companionAddress
              : hubAddress,
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
            done: true,
          };

          setTransactionsToExecute(newSteps);
        }
      }

      setShouldShowConfirmation(true);
      setShouldShowSteps(false);
      setCurrentTransaction(result.hash);
      dispatch(setFromValue(''));
      dispatch(setRate('0'));
      dispatch(setToYield(undefined));
      dispatch(setFromYield(undefined));
      setCreateStep(0);
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
      setModalError({
        content: <FormattedMessage description="modalErrorCreatingPosition" defaultMessage="Error creating position" />,
        /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        error: { code: e.code, message: e.message, data: e.data },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const handleSafeApproveAndSwap = async () => {
    if (!from || !to || !loadedAsSafeApp || !activeWallet?.address) return;
    setShouldShowStalePairModal(false);
    const fromSymbol = from.symbol;

    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
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
      const hubAddress = contractService.getHUBAddress(currentNetwork.chainId);
      const companionAddress = contractService.getHUBCompanionAddress(currentNetwork.chainId);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      result.hash = result.safeTxHash;

      addTransaction(result as unknown as TransactionResponse, {
        type: TransactionTypes.newPosition,
        typeData: {
          from,
          to,
          fromYield: shouldEnableYield ? fromYield?.tokenAddress : undefined,
          toYield: shouldEnableYield ? toYield?.tokenAddress : undefined,
          fromValue,
          frequencyType: frequencyType.toString(),
          frequencyValue,
          startedAt: Date.now(),
          id: result.safeTxHash,
          isCreatingPair: !existingPair,
          version: LATEST_VERSION,
          addressFor:
            to.address === PROTOCOL_TOKEN_ADDRESS || from.address === PROTOCOL_TOKEN_ADDRESS
              ? companionAddress
              : hubAddress,
        },
      });
      setModalClosed({ content: '' });

      setShouldShowConfirmation(true);
      setShouldShowSteps(false);
      setCurrentTransaction(result.safeTxHash);
      dispatch(setFromValue(''));
      dispatch(setRate('0'));
      dispatch(setToYield(undefined));
      dispatch(setFromYield(undefined));
      setCreateStep(0);
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
        error: { code: e.code, message: e.message, data: e.data },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const handleApproveTransactionConfirmed = () => {
    if (!transactionsToExecute?.length) {
      return null;
    }

    const newSteps = [...transactionsToExecute];

    const index = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_WAIT_FOR_APPROVAL });

    if (index !== -1) {
      newSteps[index] = {
        ...newSteps[index],
        done: true,
        checkForPending: false,
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

    const signIndex = findIndex(transactions, { type: TRANSACTION_ACTION_APPROVE_TOKEN_SIGN });

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

  const handleSignPermit2Approval = async (amount?: BigNumber) => {
    if (!from || !to || !amount || !activeWallet?.address) return;

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

        const approveIndex = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_APPROVE_TOKEN_SIGN });

        if (approveIndex !== -1) {
          newSteps[approveIndex] = {
            ...newSteps[approveIndex],
            done: true,
          };
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
    }
  };

  const handleBackTransactionSteps = () => {
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
          parseUnits(newFromValue, from.decimals).gt(BigNumber.from(0)) &&
          frequencyValue &&
          BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
          from &&
          formatUnits(parseUnits(newFromValue, from.decimals).div(BigNumber.from(frequencyValue)), from.decimals)) ||
          '0'
      )
    );
  };

  const handleRateValueChange = (newRate: string) => {
    if (!from) return;
    dispatch(setModeType(ModeTypesIds.RATE_TYPE));
    dispatch(setRate(newRate));
    dispatch(
      setFromValue(
        (newRate &&
          parseUnits(newRate, from.decimals).gt(BigNumber.from(0)) &&
          frequencyValue &&
          BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
          from &&
          formatUnits(parseUnits(newRate, from.decimals).mul(BigNumber.from(frequencyValue)), from.decimals)) ||
          ''
      )
    );
    trackEvent('DCA - Set rate step 2');
  };

  const handleFrequencyChange = (newFrequencyValue: string) => {
    if (!from) return;
    dispatch(setFrequencyValue(newFrequencyValue));
    trackEvent('DCA - Set frequency value', {});
    if (modeType === ModeTypesIds.RATE_TYPE) {
      dispatch(
        setFromValue(
          (rate &&
            parseUnits(rate, from.decimals).gt(BigNumber.from(0)) &&
            newFrequencyValue &&
            BigNumber.from(newFrequencyValue).gt(BigNumber.from(0)) &&
            from &&
            formatUnits(parseUnits(rate, from.decimals).mul(BigNumber.from(newFrequencyValue)), from.decimals)) ||
            ''
        )
      );
    } else {
      dispatch(
        setRate(
          (fromValue &&
            parseUnits(fromValue, from.decimals).gt(BigNumber.from(0)) &&
            newFrequencyValue &&
            BigNumber.from(newFrequencyValue).gt(BigNumber.from(0)) &&
            from &&
            formatUnits(parseUnits(fromValue, from.decimals).div(BigNumber.from(newFrequencyValue)), from.decimals)) ||
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

      newSteps.push({
        hash: '',
        onAction: (steps: TransactionStep[]) => handlePermit2Signed(steps),
        checkForPending: true,
        done: false,
        type: TRANSACTION_ACTION_WAIT_FOR_APPROVAL,
        extraData: {
          token: from,
          amount: amountToApprove,
        },
      });
    }

    newSteps.push({
      hash: '',
      onAction: (amount) => handleSignPermit2Approval(amount),
      checkForPending: false,
      done: false,
      type: TRANSACTION_ACTION_APPROVE_TOKEN_SIGN,
      explanation: intl.formatMessage(
        defineMessage({
          description: 'permit2SignExplanation',
          defaultMessage:
            'Mean now needs your explicit authorization to move {value} {tokenFrom} in order to create your position',
        }),
        { tokenFrom: from.symbol, value: fromValue }
      ),
      extraData: {
        token: from,
        amount: amountToApprove,
        swapper: '',
      },
    });

    newSteps.push({
      hash: '',
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
      case TRANSACTION_ACTION_APPROVE_TOKEN_SIGN:
        return handleSignPermit2Approval;
      case TRANSACTION_ACTION_APPROVE_TOKEN:
        return handleApproveToken;
      case TRANSACTION_ACTION_WAIT_FOR_APPROVAL:
        return handleApproveTransactionConfirmed;
      case TRANSACTION_ACTION_CREATE_POSITION:
        return handleSwap;
      default:
        return () => {};
    }
  }, [currentTransactionStep]);

  const preHandleApproveAndCreate = () => {
    if (!existingPair) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleMultiSteps();
      return;
    }

    const isStale =
      calculateStale(
        frequencyType,
        existingPair?.lastCreatedAt || 0,
        existingPair?.lastExecutedAt || 0,
        existingPair?.swapInfo || null
      ) === STALE;

    if (isStale) {
      setShouldShowStalePairModal(true);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleMultiSteps();
    }
  };

  const preHandleSwap = () => {
    if (!from || !to) {
      return;
    }
    const isStale =
      calculateStale(
        frequencyType,
        existingPair?.lastCreatedAt || 0,
        existingPair?.lastExecutedAt || 0,
        existingPair?.swapInfo || null
      ) === STALE;

    if (isStale) {
      setShouldShowStalePairModal(true);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleSwap();
    }
  };

  const preHandleSafeApproveAndSwap = () => {
    if (!from || !to) {
      return;
    }
    const isStale =
      calculateStale(
        frequencyType,
        existingPair?.lastCreatedAt || 0,
        existingPair?.lastExecutedAt || 0,
        existingPair?.swapInfo || null
      ) === STALE;

    if (isStale) {
      setShouldShowStalePairModal(true);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleSafeApproveAndSwap();
    }
  };

  const POSSIBLE_ACTIONS_FUNCTIONS = {
    createPosition: handleSwap,
    safeApproveAndCreatePosition: preHandleSafeApproveAndSwap,
    approveAndCreatePosition: handleMultiSteps,
  };

  const PRE_POSSIBLE_ACTIONS_FUNCTIONS = {
    createPosition: preHandleSwap,
    safeApproveAndCreatePosition: preHandleSafeApproveAndSwap,
    approveAndCreatePosition: preHandleApproveAndCreate,
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  const onButtonClick = async (actionToDo: keyof typeof POSSIBLE_ACTIONS) => {
    setCurrentAction(actionToDo);
    if (PRE_POSSIBLE_ACTIONS_FUNCTIONS[actionToDo]) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      PRE_POSSIBLE_ACTIONS_FUNCTIONS[actionToDo]();

      if (actionToDo === 'createPosition') {
        trackEvent('DCA - Create position', { fromAddress: from?.address, toAddress: to?.address });
      }
    }
  };

  const cantFund = !!from && !!fromValue && !!balance && parseUnits(fromValue, from.decimals).gt(balance);

  const handleSetStep = (step: 0 | 1) => {
    if (isRender) {
      setIsRender(false);
    }

    setCreateStep(step);
    if (step === 1) {
      trackEvent('DCA - Continue to step 2', { fromAddress: from?.address, toAddress: to?.address });
    } else {
      trackEvent('DCA - Go back to step 1', { fromAddress: from?.address, toAddress: to?.address });
    }
  };

  const filteredFrequencies = availableFrequencies.filter(
    (frequency) =>
      !(WHALE_MODE_FREQUENCIES[currentNetwork.chainId] || WHALE_MODE_FREQUENCIES[NETWORKS.optimism.chainId]).includes(
        frequency.value.toString()
      )
  );

  const tokenPickerModalTitle = selecting === from ? sellMessage : receiveMessage;

  return (
    <StyledPaper variant="outlined" ref={containerRef}>
      <TransactionSteps
        shouldShow={shouldShowSteps}
        handleClose={handleBackTransactionSteps}
        transactions={transactionsToExecute}
        onAction={transactionOnAction}
      />
      <PositionConfirmation
        shouldShow={shouldShowConfirmation}
        transaction={currentTransaction}
        handleClose={() => setShouldShowConfirmation(false)}
      />
      <StalePairModal
        open={shouldShowStalePairModal}
        onConfirm={() => POSSIBLE_ACTIONS_FUNCTIONS[currentAction]()}
        onCancel={() => setShouldShowStalePairModal(false)}
      />

      <TokenPickerModal
        shouldShow={shouldShowPicker}
        onClose={() => setShouldShowPicker(false)}
        modalTitle={tokenPickerModalTitle}
        onChange={(from && selecting.address === from.address) || selecting.address === 'from' ? onSetFrom : onSetTo}
        ignoreValues={[]}
        yieldOptions={yieldOptions}
        account={activeWallet?.address}
        isLoadingYieldOptions={isLoadingYieldOptions}
        otherSelected={(from && selecting.address === from.address) || selecting.address === 'from' ? to : from}
      />
      <Slide
        direction="right"
        appear
        in={createStep === 0}
        container={containerRef.current}
        onEntered={() => setShowFirstStep(true)}
        onExit={() => {
          setShowSecondStep(true);
          setShowFirstStep(false);
        }}
        mountOnEnter
        unmountOnExit
        timeout={isRender ? 0 : 500}
        easing="ease-out"
      >
        <StyledGrid container rowSpacing={2} $show={showFirstStep} $zIndex={90}>
          <Grid item xs={12}>
            <SwapFirstStep
              startSelectingCoin={startSelectingCoin}
              cantFund={cantFund}
              balance={balance}
              frequencies={filteredFrequencies}
              handleFrequencyChange={handleFrequencyChange}
              fromValueUsdPrice={fromValueUsdPrice}
              onChangeNetwork={handleChangeNetwork}
              handleFromValueChange={handleFromValueChange}
            />
          </Grid>
          <Grid item xs={12}>
            <StyledContentContainer>
              <DcaButton
                onClick={onButtonClick}
                cantFund={cantFund}
                usdPrice={usdPrice}
                shouldEnableYield={shouldEnableYield}
                isApproved={isApproved}
                allowanceErrors={allowanceErrors}
                balance={balance}
                fromCanHaveYield={fromCanHaveYield}
                toCanHaveYield={toCanHaveYield}
                isLoadingUsdPrice={isLoadingUsdPrice}
                handleSetStep={handleSetStep}
                step={createStep}
                rateUsdPrice={rateUsdPrice}
                fromValueUsdPrice={fromValueUsdPrice}
              />
            </StyledContentContainer>
          </Grid>
        </StyledGrid>
      </Slide>
      <Slide
        direction="left"
        in={createStep === 1}
        container={containerRef.current}
        onEntered={() => setShowSecondStep(true)}
        onExited={() => setShowSecondStep(false)}
        mountOnEnter
        unmountOnExit
        timeout={500}
        easing="ease-out"
      >
        <StyledGrid container rowSpacing={2} $show={showSecondStep} $zIndex={89}>
          <Grid item xs={12}>
            <SwapSecondStep
              onBack={() => setCreateStep(0)}
              fromValueUsdPrice={fromValueUsdPrice}
              rateUsdPrice={rateUsdPrice}
              handleRateValueChange={handleRateValueChange}
              handleFromValueChange={handleFromValueChange}
              handleFrequencyChange={handleFrequencyChange}
              yieldEnabled={shouldEnableYield}
              fromCanHaveYield={fromCanHaveYield}
              toCanHaveYield={toCanHaveYield}
              yieldOptions={yieldOptions}
              isLoadingYieldOptions={isLoadingYieldOptions}
              usdPrice={usdPrice}
            />
          </Grid>
          <Grid item xs={12}>
            <StyledContentContainer>
              <DcaButton
                onClick={onButtonClick}
                cantFund={cantFund}
                usdPrice={usdPrice}
                shouldEnableYield={shouldEnableYield}
                balance={balance}
                isApproved={isApproved}
                allowanceErrors={allowanceErrors}
                fromCanHaveYield={fromCanHaveYield}
                toCanHaveYield={toCanHaveYield}
                isLoadingUsdPrice={isLoadingUsdPrice}
                handleSetStep={handleSetStep}
                step={createStep}
                rateUsdPrice={rateUsdPrice}
                fromValueUsdPrice={fromValueUsdPrice}
              />
              <NextSwapAvailable existingPair={existingPair} yieldEnabled={yieldEnabled} />
            </StyledContentContainer>
          </Grid>
        </StyledGrid>
      </Slide>
    </StyledPaper>
  );
};
export default Swap;
