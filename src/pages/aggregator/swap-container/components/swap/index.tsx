import React from 'react';
import { formatUnits, parseUnits } from '@ethersproject/units';
import Paper from '@mui/material/Paper';
import styled from 'styled-components';
import {
  ApproveTokenExactTypeData,
  ApproveTokenTypeData,
  BlowfishResponse,
  SwapOption,
  SwapOptionWithTx,
  SwapTypeData,
  Token,
  TransactionTypes,
  UnwrapTypeData,
  WrapTypeData,
} from '@types';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import findIndex from 'lodash/findIndex';
import useBalance from '@hooks/useBalance';
import Button from '@common/components/button';
import {
  BLOWFISH_ENABLED_CHAINS,
  TRANSACTION_ACTION_APPROVE_TOKEN,
  TRANSACTION_ACTION_SWAP,
  TRANSACTION_ACTION_WAIT_FOR_APPROVAL,
  TRANSACTION_ACTION_WAIT_FOR_SIMULATION,
} from '@constants';
import Tooltip from '@mui/material/Tooltip';
import SendIcon from '@mui/icons-material/Send';
import useTransactionModal from '@hooks/useTransactionModal';
import { emptyTokenWithAddress, formatCurrencyAmount } from '@common/utils/currency';
import { useTransactionAdder } from '@state/transactions/hooks';
import { BigNumber } from 'ethers';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useWalletService from '@hooks/useWalletService';
import useAggregatorService from '@hooks/useAggregatorService';
import useSpecificAllowance from '@hooks/useSpecificAllowance';
import TransferToModal from '@common/components/transfer-to-modal';
import TransactionConfirmation from '@common/components/transaction-confirmation';
import TransactionSteps, { TransactionAction as TransactionStep } from '@common/components/transaction-steps';
import { useAppDispatch } from '@state/hooks';
import useSimulationService from '@hooks/useSimulationService';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { shouldTrackError } from '@common/utils/errors';
import useErrorService from '@hooks/useErrorService';
import { addCustomToken } from '@state/token-lists/actions';
import useLoadedAsSafeApp from '@hooks/useLoadedAsSafeApp';
import useTrackEvent from '@hooks/useTrackEvent';
import { TransactionResponse } from '@ethersproject/providers';
import Grid from '@mui/material/Grid';
import { resetForm, setFrom, setFromValue, setSelectedRoute, setTo, setToValue } from '@state/aggregator/actions';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { useAggregatorState } from '@state/aggregator/hooks';
import useReplaceHistory from '@hooks/useReplaceHistory';
import SwapFirstStep from '../step1';
import SwapSettings from '../swap-settings';
import TokenPicker from '../aggregator-token-picker';
import SwapButton from '../swap-button';

const StyledButtonContainer = styled.div`
  display: flex;
  flex: 1;
  background-color: #292929;
  position: relative;
  padding: 16px;
  border-radius: 8px;
  border-top-right-radius: 0px;
  border-top-left-radius: 0px;
  gap: 10px;
`;

const StyledIconButton = styled(Button)`
  border-radius: 12px;
  min-width: 45px;
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

const StyledGrid = styled(Grid)`
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 90;
`;

interface SwapProps {
  isLoadingRoute: boolean;
  setRefreshQuotes: (refreshQuotes: boolean) => void;
  quotes: SwapOption[];
  fetchOptions: () => void;
  refreshQuotes: boolean;
  swapOptionsError?: string;
}

const Swap = ({
  isLoadingRoute,
  setRefreshQuotes,
  quotes,
  fetchOptions,
  refreshQuotes,
  swapOptionsError,
}: SwapProps) => {
  const { fromValue, from, to, toValue, isBuyOrder, selectedRoute, transferTo } = useAggregatorState();
  const dispatch = useAppDispatch();
  const currentNetwork = useSelectedNetwork();
  const containerRef = React.useRef(null);
  const [shouldShowPicker, setShouldShowPicker] = React.useState(false);
  const [shouldShowConfirmation, setShouldShowConfirmation] = React.useState(false);
  const [shouldShowSettings, setShouldShowSettings] = React.useState(false);
  const errorService = useErrorService();
  const [shouldShowSteps, setShouldShowSteps] = React.useState(false);
  const [selecting, setSelecting] = React.useState(from || emptyTokenWithAddress('from'));
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const walletService = useWalletService();
  const aggregatorService = useAggregatorService();
  const [balance, , balanceErrors] = useBalance(from);
  const [shouldShowTransferModal, setShouldShowTransferModal] = React.useState(false);
  const [transactionWillFail, setTransactionWillFail] = React.useState(false);
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const [currentTransaction, setCurrentTransaction] = React.useState('');
  const [transactionsToExecute, setTransactionsToExecute] = React.useState<TransactionStep[]>([]);
  const simulationService = useSimulationService();
  const actualCurrentNetwork = useCurrentNetwork();
  const loadedAsSafeApp = useLoadedAsSafeApp();
  const trackEvent = useTrackEvent();
  const replaceHistory = useReplaceHistory();

  const isOnCorrectNetwork = actualCurrentNetwork.chainId === currentNetwork.chainId;
  const [allowance, , allowanceErrors] = useSpecificAllowance(from, selectedRoute?.swapper.allowanceTarget);

  const fromValueToUse =
    isBuyOrder && selectedRoute
      ? (selectedRoute?.sellToken.address === from?.address &&
          formatUnits(selectedRoute.sellAmount.amount, selectedRoute.sellToken.decimals)) ||
        '0'
      : fromValue;

  const toValueToUse = isBuyOrder
    ? toValue
    : (selectedRoute?.buyToken.address === to?.address &&
        formatUnits(selectedRoute?.buyAmount.amount || '0', selectedRoute?.buyToken.decimals)) ||
      '0' ||
      '';

  const onResetForm = () => {
    dispatch(resetForm());
  };

  const handleApproveToken = async (transactions?: TransactionStep[], amount?: BigNumber) => {
    if (!from || !to || !selectedRoute) return;
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
      trackEvent('Aggregator - Approve token submitting', {
        source: selectedRoute.swapper.id,
        fromSteps: !!transactions?.length,
      });
      const result = await walletService.approveSpecificToken(from, selectedRoute.swapper.allowanceTarget, amount);
      trackEvent('Aggregator - Approve token submitted', {
        source: selectedRoute.swapper.id,
        fromSteps: !!transactions?.length,
      });

      const transactionTypeDataBase = {
        token: from,
        addressFor: selectedRoute.swapper.allowanceTarget,
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

      if (transactions?.length) {
        const newSteps = [...transactions];

        const approveIndex = findIndex(transactions, { type: TRANSACTION_ACTION_APPROVE_TOKEN });

        if (approveIndex !== -1) {
          newSteps[approveIndex] = {
            ...newSteps[approveIndex],
            done: true,
            hash: result.hash,
          };

          const waitIndex = findIndex(transactions, { type: TRANSACTION_ACTION_WAIT_FOR_APPROVAL });
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
      if (shouldTrackError(e)) {
        trackEvent('Aggregator - Approve token error', {
          source: selectedRoute.swapper.id,
          fromSteps: !!transactions?.length,
        });
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error approving aggregator', JSON.stringify(e), {
          swapper: selectedRoute.swapper.id,
          chainId: currentNetwork.chainId,
          from: selectedRoute.sellToken.address,
          to: selectedRoute.buyToken.address,
          buyAmount: selectedRoute.buyAmount.amountInUnits,
          sellAmount: selectedRoute.sellAmount.amountInUnits,
          type: selectedRoute.type,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      setModalError({ content: 'Error approving token', error: { code: e.code, message: e.message, data: e.data } });
    }
  };

  const handleSwap = async (transactions?: TransactionStep[]) => {
    if (!from || !to || !selectedRoute || !selectedRoute.tx) return;
    const fromSymbol = from.symbol;
    const toSymbol = to.symbol;
    const fromAmount = formatCurrencyAmount(selectedRoute.sellAmount.amount, from, 4, 6);
    const toAmount = formatCurrencyAmount(selectedRoute.buyAmount.amount, to, 4, 6);
    try {
      const isWrap = from?.address === PROTOCOL_TOKEN_ADDRESS && to?.address === wrappedProtocolToken.address;
      const isUnwrap = from?.address === wrappedProtocolToken.address && to?.address === PROTOCOL_TOKEN_ADDRESS;
      setRefreshQuotes(false);

      setModalLoading({
        content: (
          <Typography variant="body1">
            {isWrap && <FormattedMessage description="wrap agg loading" defaultMessage="Wrapping" />}
            {isUnwrap && <FormattedMessage description="unwrap agg loading" defaultMessage="Unwrapping" />}
            {((from?.address !== PROTOCOL_TOKEN_ADDRESS && from?.address !== wrappedProtocolToken.address) ||
              (to?.address !== PROTOCOL_TOKEN_ADDRESS && to?.address !== wrappedProtocolToken.address)) && (
              <FormattedMessage description="swap agg loading" defaultMessage="Swapping" />
            )}
            {` `}
            <FormattedMessage
              description="swap aggregator loading title"
              defaultMessage="{fromAmount} {from} for {toAmount} {to} for you"
              values={{ from: fromSymbol, to: toSymbol, fromAmount, toAmount }}
            />
          </Typography>
        ),
      });

      let balanceBefore: BigNumber | null = null;

      if (from.address === PROTOCOL_TOKEN_ADDRESS || to.address === PROTOCOL_TOKEN_ADDRESS) {
        balanceBefore = await walletService.getBalance(PROTOCOL_TOKEN_ADDRESS, selectedRoute.transferTo || undefined);
      }

      trackEvent('Aggregator - Swap submitting', {
        source: selectedRoute.swapper.id,
        fromSteps: !!transactions?.length,
      });
      const result = await aggregatorService.swap(selectedRoute as SwapOptionWithTx);
      trackEvent('Aggregator - Swap submitted', {
        source: selectedRoute.swapper.id,
        fromSteps: !!transactions?.length,
      });

      try {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        trackEvent('Swap on aggregator', {
          swapper: selectedRoute.swapper.id,
          from: selectedRoute.sellToken.address,
          fromSymbol: selectedRoute.sellToken.symbol,
          to: selectedRoute.buyToken.address,
          toSymbol: selectedRoute.buyToken.symbol,
          buyAmount: selectedRoute.buyAmount.amountInUnits,
          sellAmount: selectedRoute.sellAmount.amountInUnits,
          buyAmountUsd: selectedRoute.buyAmount.amountInUSD,
          sellAmountUsd: selectedRoute.sellAmount.amountInUSD,
          type: selectedRoute.type,
        });
      } catch (e) {
        console.error('Error tracking through mixpanel', e);
      }

      const baseTransactionData = {
        from: fromSymbol,
        to: toSymbol,
        amountFrom: fromAmount,
        amountTo: toAmount,
        balanceBefore: (balanceBefore && balanceBefore?.toString()) || null,
        transferTo,
      };

      let transactionTypeData: SwapTypeData | WrapTypeData | UnwrapTypeData = {
        type: TransactionTypes.swap,
        typeData: baseTransactionData,
      };

      if (isWrap) {
        transactionTypeData = {
          type: TransactionTypes.wrap,
          typeData: baseTransactionData,
        };
      } else if (isUnwrap) {
        transactionTypeData = {
          type: TransactionTypes.unwrap,
          typeData: baseTransactionData,
        };
      }

      addTransaction(result, transactionTypeData);

      setModalClosed({ content: '' });
      setCurrentTransaction(result.hash);
      setShouldShowConfirmation(true);
      setShouldShowSteps(false);

      if (transactions?.length) {
        const newSteps = [...transactions];

        const index = findIndex(transactions, { type: TRANSACTION_ACTION_SWAP });

        if (index !== -1) {
          newSteps[index] = {
            ...newSteps[index],
            hash: result.hash,
            done: true,
          };

          setTransactionsToExecute(newSteps);
        }
      }

      setRefreshQuotes(true);

      onResetForm();
    } catch (e) {
      if (shouldTrackError(e)) {
        trackEvent('Aggregator - Swap error', { source: selectedRoute.swapper.id, fromSteps: !!transactions?.length });
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error swapping', JSON.stringify(e), {
          swapper: selectedRoute.swapper.id,
          chainId: currentNetwork.chainId,
          from: selectedRoute.sellToken.address,
          to: selectedRoute.buyToken.address,
          buyAmount: selectedRoute.buyAmount.amountInUnits,
          sellAmount: selectedRoute.sellAmount.amountInUnits,
          type: selectedRoute.type,
        });
      }
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({ content: 'Error swapping', error: { code: e.code, message: e.message, data: e.data } });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setRefreshQuotes(true);
    }
  };

  const handleSafeApproveAndSwap = async (transactions?: TransactionStep[]) => {
    if (!from || !to || !selectedRoute || !selectedRoute.tx || !loadedAsSafeApp) return;
    const fromSymbol = from.symbol;
    const toSymbol = to.symbol;
    const fromAmount = formatCurrencyAmount(selectedRoute.sellAmount.amount, from, 4, 6);
    const toAmount = formatCurrencyAmount(selectedRoute.buyAmount.amount, to, 4, 6);
    try {
      const isWrap = from?.address === PROTOCOL_TOKEN_ADDRESS && to?.address === wrappedProtocolToken.address;
      const isUnwrap = from?.address === wrappedProtocolToken.address && to?.address === PROTOCOL_TOKEN_ADDRESS;
      setRefreshQuotes(false);

      setModalLoading({
        content: (
          <Typography variant="body1">
            {isWrap && <FormattedMessage description="wrap agg loading" defaultMessage="Wrapping" />}
            {isUnwrap && <FormattedMessage description="unwrap agg loading" defaultMessage="Unwrapping" />}
            {((from?.address !== PROTOCOL_TOKEN_ADDRESS && from?.address !== wrappedProtocolToken.address) ||
              (to?.address !== PROTOCOL_TOKEN_ADDRESS && to?.address !== wrappedProtocolToken.address)) && (
              <FormattedMessage description="swap agg loading" defaultMessage="Swapping" />
            )}
            {` `}
            <FormattedMessage
              description="swap aggregator loading title"
              defaultMessage="{fromAmount} {from} for {toAmount} {to} for you"
              values={{ from: fromSymbol, to: toSymbol, fromAmount, toAmount }}
            />
          </Typography>
        ),
      });

      let balanceBefore: BigNumber | null = null;

      if (from.address === PROTOCOL_TOKEN_ADDRESS || to.address === PROTOCOL_TOKEN_ADDRESS) {
        balanceBefore = await walletService.getBalance(PROTOCOL_TOKEN_ADDRESS);
      }

      trackEvent('Aggregator - Safe swap submitting', {
        source: selectedRoute.swapper.id,
        fromSteps: !!transactions?.length,
      });
      const result = await aggregatorService.approveAndSwapSafe(selectedRoute as SwapOptionWithTx);
      trackEvent('Aggregator - Safe swap submitted', {
        source: selectedRoute.swapper.id,
        fromSteps: !!transactions?.length,
      });

      try {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        trackEvent('Swap on aggregator', {
          swapper: selectedRoute.swapper.id,
          from: selectedRoute.sellToken.address,
          fromSymbol: selectedRoute.sellToken.symbol,
          to: selectedRoute.buyToken.address,
          toSymbol: selectedRoute.buyToken.symbol,
          buyAmount: selectedRoute.buyAmount.amountInUnits,
          sellAmount: selectedRoute.sellAmount.amountInUnits,
          buyAmountUsd: selectedRoute.buyAmount.amountInUSD,
          sellAmountUsd: selectedRoute.sellAmount.amountInUSD,
          type: selectedRoute.type,
        });
      } catch (e) {
        console.error('Error tracking through mixpanel', e);
      }

      const baseTransactionData = {
        from: fromSymbol,
        to: toSymbol,
        amountFrom: fromAmount,
        amountTo: toAmount,
        balanceBefore: (balanceBefore && balanceBefore?.toString()) || null,
        transferTo,
      };
      let transactionTypeData: SwapTypeData | WrapTypeData | UnwrapTypeData = {
        type: TransactionTypes.swap,
        typeData: baseTransactionData,
      };

      if (isWrap) {
        transactionTypeData = {
          type: TransactionTypes.wrap,
          typeData: baseTransactionData,
        };
      } else if (isUnwrap) {
        transactionTypeData = {
          type: TransactionTypes.unwrap,
          typeData: baseTransactionData,
        };
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      result.hash = result.safeTxHash;

      addTransaction(result as unknown as TransactionResponse, transactionTypeData);

      setModalClosed({ content: '' });
      setCurrentTransaction(result.safeTxHash);
      setShouldShowConfirmation(true);
      setShouldShowSteps(false);

      if (transactions?.length) {
        const newSteps = [...transactions];

        const index = findIndex(transactions, { type: TRANSACTION_ACTION_SWAP });

        if (index !== -1) {
          newSteps[index] = {
            ...newSteps[index],
            hash: result.safeTxHash,
            done: true,
          };

          setTransactionsToExecute(newSteps);
        }
      }

      setRefreshQuotes(true);

      onResetForm();
    } catch (e) {
      if (shouldTrackError(e)) {
        trackEvent('Aggregator - Safe swap error', {
          source: selectedRoute.swapper.id,
          fromSteps: !!transactions?.length,
        });
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error swapping', JSON.stringify(e), {
          swapper: selectedRoute.swapper.id,
          chainId: currentNetwork.chainId,
          from: selectedRoute.sellToken.address,
          to: selectedRoute.buyToken.address,
          buyAmount: selectedRoute.buyAmount.amountInUnits,
          sellAmount: selectedRoute.sellAmount.amountInUnits,
          type: selectedRoute.type,
        });
      }
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({ content: 'Error swapping', error: { code: e.code, message: e.message, data: e.data } });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setRefreshQuotes(true);
    }
  };

  const addCustomTokenToList = (token: Token) => {
    dispatch(addCustomToken(token));
    trackEvent('Aggregator - Add custom token', {
      tokenSymbol: token.symbol,
      tokenAddress: token.address,
      chainId: currentNetwork.chainId,
    });
  };

  const handleTransactionSimulationWait = (transactions?: TransactionStep[], response?: BlowfishResponse) => {
    if (!transactions?.length) {
      return;
    }

    const newSteps = [...transactions];

    const index = findIndex(transactions, { type: TRANSACTION_ACTION_WAIT_FOR_SIMULATION });

    if (index !== -1) {
      newSteps[index] = {
        ...newSteps[index],
        done: true,
        failed: !response,
        checkForPending: false,
        extraData: {
          ...newSteps[index].extraData,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          simulation: response,
        },
      };

      setTransactionsToExecute(newSteps);

      if (!response || response.simulationResults.error) {
        trackEvent('Aggregator - Transaction simulation error', { source: selectedRoute?.swapper.id });
      } else {
        trackEvent('Aggregator - Transaction simulation successfull', { source: selectedRoute?.swapper.id });
      }
    }
  };

  const handleTransactionEndedForWait = (transactions?: TransactionStep[]) => {
    if (!transactions?.length) {
      return;
    }

    const newSteps = [...transactions];

    const index = findIndex(transactions, { type: TRANSACTION_ACTION_WAIT_FOR_APPROVAL });

    if (index !== -1) {
      newSteps[index] = {
        ...newSteps[index],
        done: true,
        checkForPending: false,
      };

      setTransactionsToExecute(newSteps);

      if (
        newSteps[index + 1] &&
        newSteps[index + 1].type === TRANSACTION_ACTION_WAIT_FOR_SIMULATION &&
        selectedRoute &&
        selectedRoute.tx
      ) {
        const simulatePromise = simulationService.simulateTransaction(
          selectedRoute.tx,
          currentNetwork.chainId,
          !!transferTo
        );
        simulatePromise
          .then((blowfishResponse) => blowfishResponse && handleTransactionSimulationWait(newSteps, blowfishResponse))
          .catch(() => handleTransactionSimulationWait(newSteps));
      }
    }
  };

  const handleMultiSteps = () => {
    if (!from || fromValueToUse === '' || !to || !selectedRoute) {
      return;
    }

    const newSteps: TransactionStep[] = [];

    const amountToApprove =
      isBuyOrder && selectedRoute
        ? BigNumber.from(selectedRoute.maxSellAmount.amount)
        : parseUnits(fromValueToUse, from.decimals);

    newSteps.push({
      hash: '',
      onAction: handleApproveToken,
      checkForPending: false,
      done: false,
      type: TRANSACTION_ACTION_APPROVE_TOKEN,
      extraData: {
        token: from,
        amount: amountToApprove,
        swapper: selectedRoute.swapper.name,
      },
    });

    newSteps.push({
      hash: '',
      onAction: handleTransactionEndedForWait,
      checkForPending: true,
      done: false,
      type: TRANSACTION_ACTION_WAIT_FOR_APPROVAL,
      extraData: {
        token: from,
        amount: amountToApprove,
      },
    });

    if (BLOWFISH_ENABLED_CHAINS.includes(currentNetwork.chainId) && selectedRoute.tx) {
      newSteps.push({
        hash: '',
        onAction: handleTransactionSimulationWait,
        checkForPending: true,
        done: false,
        type: TRANSACTION_ACTION_WAIT_FOR_SIMULATION,
        extraData: {
          tx: selectedRoute.tx,
          chainId: currentNetwork.chainId,
        },
      });
    }

    newSteps.push({
      hash: '',
      onAction: handleSwap,
      checkForPending: true,
      done: false,
      type: TRANSACTION_ACTION_SWAP,
      extraData: {
        from,
        to,
        sellAmount: parseUnits(fromValueToUse, from.decimals),
        buyAmount: parseUnits(toValueToUse, to.decimals),
      },
    });

    trackEvent('Aggregator - Start swap steps');
    setTransactionsToExecute(newSteps);
    setRefreshQuotes(false);
    setShouldShowSteps(true);
  };

  const startSelectingCoin = (token: Token) => {
    setSelecting(token);
    setShouldShowPicker(true);
    trackEvent('Aggregator - start selecting coin', {
      selected: token.address,
      is: selecting.address === from?.address ? 'from' : 'to',
    });
  };

  const handleBackTransactionSteps = () => {
    setShouldShowSteps(false);
    setRefreshQuotes(true);
  };

  const onSetFrom = (newFrom: Token, updateMode = false) => {
    dispatch(setSelectedRoute(null));
    dispatch(setFromValue({ value: '', updateMode }));
    dispatch(setFrom(newFrom));
    replaceHistory(`/swap/${currentNetwork.chainId}/${newFrom.address}/${to?.address || ''}`);
    trackEvent('Aggregator - Set from', { fromAddress: newFrom?.address, toAddress: to?.address });
  };

  const onSetTo = (newTo: Token, updateMode = false) => {
    dispatch(setSelectedRoute(null));
    dispatch(setToValue({ value: '', updateMode }));
    dispatch(setTo(newTo));
    if (from) {
      replaceHistory(`/swap/${currentNetwork.chainId}/${from.address || ''}/${newTo.address}`);
    }
    trackEvent('Aggregator - Set to', { fromAddress: newTo?.address, toAddress: from?.address });
  };

  const formattedUnits =
    selectedRoute?.maxSellAmount.amount &&
    formatUnits(selectedRoute.maxSellAmount.amount, selectedRoute.sellToken.decimals);

  const cantFund =
    !!from &&
    isOnCorrectNetwork &&
    !!fromValueToUse &&
    !!balance &&
    parseUnits(formattedUnits || fromValueToUse, selectedRoute?.sellToken.decimals || from.decimals).gt(balance);

  const isApproved =
    !from ||
    !selectedRoute ||
    (from &&
      selectedRoute &&
      ((allowance.allowance &&
        allowance.token.address === from.address &&
        parseUnits(allowance.allowance, from.decimals).gte(selectedRoute.maxSellAmount.amount)) ||
        from.address === PROTOCOL_TOKEN_ADDRESS));

  return (
    <>
      <TransferToModal
        transferTo={transferTo}
        onCancel={() => setShouldShowTransferModal(false)}
        open={shouldShowTransferModal}
      />
      <StyledPaper variant="outlined" ref={containerRef}>
        <SwapSettings shouldShow={shouldShowSettings} onClose={() => setShouldShowSettings(false)} />
        <TransactionConfirmation
          to={to}
          from={from}
          shouldShow={shouldShowConfirmation}
          transaction={currentTransaction}
          handleClose={() => setShouldShowConfirmation(false)}
        />
        <TransactionSteps
          shouldShow={shouldShowSteps}
          handleClose={handleBackTransactionSteps}
          transactions={transactionsToExecute}
        />
        <TokenPicker
          shouldShow={shouldShowPicker}
          onClose={() => setShouldShowPicker(false)}
          isFrom={selecting === from}
          onChange={(from && selecting.address === from.address) || selecting.address === 'from' ? onSetFrom : onSetTo}
          ignoreValues={[]}
          yieldOptions={[]}
          isLoadingYieldOptions={false}
          onAddToken={addCustomTokenToList}
        />
        <StyledGrid container rowSpacing={2}>
          <Grid item xs={12}>
            <SwapFirstStep
              from={from}
              to={to}
              setTransactionWillFail={setTransactionWillFail}
              toValue={toValueToUse}
              startSelectingCoin={startSelectingCoin}
              cantFund={cantFund}
              balance={balance}
              selectedRoute={selectedRoute}
              isBuyOrder={isBuyOrder}
              isLoadingRoute={isLoadingRoute}
              transferTo={transferTo}
              onOpenTransferTo={() => setShouldShowTransferModal(true)}
              onShowSettings={() => setShouldShowSettings(true)}
              isApproved={isApproved}
              fromValue={fromValue}
              quotes={quotes}
              fetchOptions={fetchOptions}
              refreshQuotes={refreshQuotes}
              swapOptionsError={swapOptionsError}
            />
            <StyledButtonContainer>
              <SwapButton
                cantFund={cantFund}
                fromValue={fromValueToUse}
                isApproved={isApproved}
                allowanceErrors={allowanceErrors}
                balance={balance}
                balanceErrors={balanceErrors}
                isLoadingRoute={isLoadingRoute}
                transactionWillFail={transactionWillFail}
                handleMultiSteps={handleMultiSteps}
                handleSwap={handleSwap}
                handleSafeApproveAndSwap={handleSafeApproveAndSwap}
              />
              {!transferTo && (
                <StyledIconButton
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => setShouldShowTransferModal(true)}
                >
                  <Tooltip
                    title={
                      <FormattedMessage
                        description="tranferToTooltip"
                        defaultMessage="Swap and transfer to another address"
                      />
                    }
                    arrow
                    placement="top"
                  >
                    <SendIcon fontSize="inherit" />
                  </Tooltip>
                </StyledIconButton>
              )}
            </StyledButtonContainer>
          </Grid>
        </StyledGrid>
      </StyledPaper>
    </>
  );
};
export default Swap;
