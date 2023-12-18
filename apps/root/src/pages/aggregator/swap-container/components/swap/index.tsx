import React from 'react';
import { formatUnits, parseUnits, Transaction } from 'viem';
import find from 'lodash/find';
import styled from 'styled-components';
import {
  AllowanceType,
  ApproveTokenExactTypeData,
  ApproveTokenTypeData,
  BlowfishResponse,
  StateChangeKind,
  SwapOption,
  SwapOptionWithTx,
  SwapTypeData,
  Token,
  TransactionActionSwapData,
  TransactionActionWaitForQuotesSimulationData,
  TransactionTypes,
  UnwrapTypeData,
  WrapTypeData,
} from '@types';
import { Typography, Tooltip, Grid, Paper, SendIcon, Button } from 'ui-library';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import findIndex from 'lodash/findIndex';
import {
  BLOWFISH_ENABLED_CHAINS,
  NETWORKS,
  PERMIT_2_ADDRESS,
  TRANSACTION_ACTION_APPROVE_TOKEN,
  TRANSACTION_ACTION_APPROVE_TOKEN_SIGN,
  TRANSACTION_ACTION_SWAP,
  TRANSACTION_ACTION_WAIT_FOR_APPROVAL,
  TRANSACTION_ACTION_WAIT_FOR_QUOTES_SIMULATION,
  TRANSACTION_ACTION_WAIT_FOR_SIMULATION,
} from '@constants';
import useTransactionModal from '@hooks/useTransactionModal';
import { emptyTokenWithAddress, emptyTokenWithDecimals, formatCurrencyAmount } from '@common/utils/currency';
import { useTransactionAdder } from '@state/transactions/hooks';

import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useWalletService from '@hooks/useWalletService';
import useAggregatorService from '@hooks/useAggregatorService';
import useSpecificAllowance from '@hooks/useSpecificAllowance';
import TransferToModal from '@common/components/transfer-to-modal';
import TransactionConfirmation from '@common/components/transaction-confirmation';
import TransactionSteps, {
  TransactionAction,
  TransactionAction as TransactionStep,
} from '@common/components/transaction-steps';
import { useAppDispatch } from '@state/hooks';
import useSimulationService from '@hooks/useSimulationService';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { shouldTrackError } from '@common/utils/errors';
import useErrorService from '@hooks/useErrorService';
import { addCustomToken } from '@state/token-lists/actions';
import useLoadedAsSafeApp from '@hooks/useLoadedAsSafeApp';
import useTrackEvent from '@hooks/useTrackEvent';
import { resetForm, setFrom, setFromValue, setSelectedRoute, setTo, setToValue } from '@state/aggregator/actions';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { useAggregatorState } from '@state/aggregator/hooks';
import usePermit2Service from '@hooks/usePermit2Service';
import { getBetterBy } from '@common/utils/quotes';
import useReplaceHistory from '@hooks/useReplaceHistory';
import useIsPermit2Enabled from '@hooks/useIsPermit2Enabled';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import SwapFirstStep from '../step1';
import SwapSettings from '../swap-settings';
import SwapButton from '../swap-button';
import BetterQuoteModal from '../better-quote-modal';
import FailedQuotesModal from '../failed-quotes-modal';
import useActiveWallet from '@hooks/useActiveWallet';
import TokenPickerModal from '@common/components/token-picker-modal';
import { useTokenBalance } from '@state/balances/hooks';

const StyledButtonContainer = styled.div`
  display: flex;
  flex: 1;
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
  backdrop-filter: blur(6px);
`;

const StyledGrid = styled(Grid)`
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 90;
`;

const sellMessage = <FormattedMessage description="You sell" defaultMessage="You sell" />;
const receiveMessage = <FormattedMessage description="You receive" defaultMessage="You receive" />;

interface SwapProps {
  isLoadingRoute: boolean;
  quotes: SwapOption[];
  fetchOptions: () => void;
  swapOptionsError?: string;
}

const Swap = ({ isLoadingRoute, quotes, fetchOptions, swapOptionsError }: SwapProps) => {
  const { fromValue, from, to, toValue, isBuyOrder, selectedRoute, transferTo } = useAggregatorState();
  const { sorting } = useAggregatorSettingsState();
  const dispatch = useAppDispatch();
  const currentNetwork = useSelectedNetwork();
  const isPermit2Enabled = useIsPermit2Enabled(currentNetwork.chainId);
  const intl = useIntl();
  const containerRef = React.useRef(null);
  const [betterQuote, setBetterQuote] = React.useState<SwapOption | null>(null);
  const [shouldShowPicker, setShouldShowPicker] = React.useState(false);
  const [shouldShowConfirmation, setShouldShowConfirmation] = React.useState(false);
  const [shouldShowSettings, setShouldShowSettings] = React.useState(false);
  const [refreshQuotes, setRefreshQuotes] = React.useState(true);
  const errorService = useErrorService();
  const [shouldShowSteps, setShouldShowSteps] = React.useState(false);
  const [selecting, setSelecting] = React.useState(from || emptyTokenWithAddress('from'));
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const walletService = useWalletService();
  const aggregatorService = useAggregatorService();
  const [shouldShowTransferModal, setShouldShowTransferModal] = React.useState(false);
  const [shouldShowBetterQuoteModal, setShouldShowBetterQuoteModal] = React.useState(false);
  const [shouldShowFailedQuotesModal, setShouldShowFailedQuotesModal] = React.useState(false);
  const [transactionWillFail, setTransactionWillFail] = React.useState(false);
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const [currentTransaction, setCurrentTransaction] = React.useState('');
  const [transactionsToExecute, setTransactionsToExecute] = React.useState<TransactionStep[]>([]);
  const simulationService = useSimulationService();
  const actualCurrentNetwork = useCurrentNetwork();
  const loadedAsSafeApp = useLoadedAsSafeApp();
  const trackEvent = useTrackEvent();
  const replaceHistory = useReplaceHistory();
  const permit2Service = usePermit2Service();
  const activeWallet = useActiveWallet();
  const { balance } = useTokenBalance({ token: from, walletAddress: activeWallet?.address, shouldAutoFetch: true });

  const isOnCorrectNetwork = actualCurrentNetwork.chainId === currentNetwork.chainId;
  const [allowance, , allowanceErrors] = useSpecificAllowance(
    from,
    activeWallet?.address || '',
    isPermit2Enabled
      ? PERMIT_2_ADDRESS[currentNetwork.chainId] || PERMIT_2_ADDRESS[NETWORKS.ethereum.chainId]
      : selectedRoute?.swapper.allowanceTarget
  );

  const fromValueToUse =
    isBuyOrder && selectedRoute
      ? (selectedRoute?.sellToken.address === from?.address &&
          formatUnits(selectedRoute.sellAmount.amount, selectedRoute.sellToken.decimals)) ||
        '0'
      : fromValue;

  const toValueToUse = isBuyOrder
    ? toValue
    : (selectedRoute?.buyToken.address === to?.address &&
        formatUnits(selectedRoute?.buyAmount.amount || 0n, selectedRoute?.buyToken.decimals || 18)) ||
      '0' ||
      '';

  const formattedUnits =
    selectedRoute?.maxSellAmount.amount &&
    formatUnits(selectedRoute.maxSellAmount.amount, selectedRoute.sellToken.decimals);

  const cantFund =
    !!from &&
    isOnCorrectNetwork &&
    !!fromValueToUse &&
    !!balance &&
    parseUnits(formattedUnits || fromValueToUse, selectedRoute?.sellToken.decimals || from.decimals) > balance;

  const isApproved =
    !from ||
    !selectedRoute ||
    (from &&
      selectedRoute &&
      ((allowance.allowance &&
        allowance.token.address === from.address &&
        parseUnits(allowance.allowance, from.decimals) >= selectedRoute.maxSellAmount.amount) ||
        from.address === PROTOCOL_TOKEN_ADDRESS));

  const onResetForm = React.useCallback(() => {
    dispatch(resetForm());
  }, [dispatch]);

  const handleApproveToken = React.useCallback(
    async (amount?: bigint) => {
      if (!from || !to || !selectedRoute || !activeWallet?.address) return;
      const fromSymbol = from.symbol;

      try {
        setModalLoading({
          content: (
            <Typography variant="body">
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
          fromSteps: !!transactionsToExecute?.length,
          isPermit2Enabled,
          approvedToken: from.symbol,
        });

        const addressToApprove = isPermit2Enabled
          ? PERMIT_2_ADDRESS[currentNetwork.chainId] || PERMIT_2_ADDRESS[NETWORKS.ethereum.chainId]
          : selectedRoute.swapper.allowanceTarget;

        const result = await walletService.approveSpecificToken(from, addressToApprove, activeWallet.address, amount);
        trackEvent('Aggregator - Approve token submitted', {
          source: selectedRoute.swapper.id,
          fromSteps: !!transactionsToExecute?.length,
          isPermit2Enabled,
          approvedToken: from.symbol,
        });

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
        if (shouldTrackError(e as Error)) {
          trackEvent('Aggregator - Approve token error', {
            source: selectedRoute.swapper.id,
            fromSteps: !!transactionsToExecute?.length,
            isPermit2Enabled,
            approvedToken: from.symbol,
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
          setModalError({
            content: 'Error approving token',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            error: { code: e.code, message: e.message, data: e.data },
          });
        } else {
          setModalClosed({});
        }
      }
    },
    [
      addTransaction,
      currentNetwork.chainId,
      errorService,
      from,
      isPermit2Enabled,
      selectedRoute,
      setModalClosed,
      setModalError,
      setModalLoading,
      to,
      trackEvent,
      transactionsToExecute,
      walletService,
    ]
  );

  const handleSwap = React.useCallback(async () => {
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
          <Typography variant="body">
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

      let balanceBefore: bigint | null = null;

      if (from.address === PROTOCOL_TOKEN_ADDRESS || to.address === PROTOCOL_TOKEN_ADDRESS) {
        balanceBefore = await walletService.getBalance(
          selectedRoute.transferTo || activeWallet?.address,
          PROTOCOL_TOKEN_ADDRESS
        );
      }

      trackEvent('Aggregator - Swap submitting', {
        source: selectedRoute.swapper.id,
        fromSteps: !!transactionsToExecute?.length,
        isPermit2Enabled,
      });

      const result = await aggregatorService.swap(selectedRoute as SwapOptionWithTx);

      trackEvent('Aggregator - Swap submitted', {
        source: selectedRoute.swapper.id,
        fromSteps: !!transactionsToExecute?.length,
        isPermit2Enabled,
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
          isPermit2Enabled,
        });
      } catch (e) {
        console.error('Error tracking through mixpanel', e);
      }

      const baseTransactionData = {
        from,
        to,
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

      if (transactionsToExecute?.length) {
        const newSteps = [...transactionsToExecute];

        const index = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_SWAP });

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
      if (shouldTrackError(e as Error)) {
        trackEvent('Aggregator - Swap error', {
          source: selectedRoute.swapper.id,
          fromSteps: !!transactionsToExecute?.length,
          isPermit2Enabled,
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
          isPermit2Enabled,
        });
        /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        setModalError({ content: 'Error swapping', error: { code: e.code, message: e.message, data: e.data } });
      } else {
        setModalClosed({});
      }
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setRefreshQuotes(true);
    }
  }, [
    addTransaction,
    aggregatorService,
    currentNetwork.chainId,
    errorService,
    from,
    isPermit2Enabled,
    selectedRoute,
    setModalClosed,
    setModalError,
    setModalLoading,
    to,
    trackEvent,
    transactionsToExecute,
    transferTo,
    walletService,
    wrappedProtocolToken.address,
  ]);

  const handleSafeApproveAndSwap = async () => {
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
          <Typography variant="body">
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

      let balanceBefore: bigint | null = null;

      if (from.address === PROTOCOL_TOKEN_ADDRESS || to.address === PROTOCOL_TOKEN_ADDRESS) {
        balanceBefore = await walletService.getBalance(activeWallet?.address, PROTOCOL_TOKEN_ADDRESS);
      }

      trackEvent('Aggregator - Safe swap submitting', {
        source: selectedRoute.swapper.id,
        fromSteps: !!transactionsToExecute?.length,
      });
      const result = await aggregatorService.approveAndSwapSafe(selectedRoute as SwapOptionWithTx);
      trackEvent('Aggregator - Safe swap submitted', {
        source: selectedRoute.swapper.id,
        fromSteps: !!transactionsToExecute?.length,
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
        from,
        to,
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

      addTransaction(result as unknown as Transaction, transactionTypeData);

      setModalClosed({ content: '' });
      setCurrentTransaction(result.safeTxHash);
      setShouldShowConfirmation(true);
      setShouldShowSteps(false);

      if (transactionsToExecute?.length) {
        const newSteps = [...transactionsToExecute];

        const index = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_SWAP });

        if (index !== -1) {
          newSteps[index] = {
            ...newSteps[index],
            hash: result.safeTxHash,
            done: true,
          };

          setTransactionsToExecute(newSteps);
        }
      }

      onResetForm();
    } catch (e) {
      if (shouldTrackError(e as Error)) {
        trackEvent('Aggregator - Safe swap error', {
          source: selectedRoute.swapper.id,
          fromSteps: !!transactionsToExecute?.length,
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
        /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        setModalError({ content: 'Error swapping', error: { code: e.code, message: e.message, data: e.data } });
      } else {
        setModalClosed({});
      }
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setRefreshQuotes(true);
    }
  };

  const addCustomTokenToList = React.useCallback(
    (token: Token) => {
      dispatch(addCustomToken(token));
      trackEvent('Aggregator - Add custom token', {
        tokenSymbol: token.symbol,
        tokenAddress: token.address,
        chainId: currentNetwork.chainId,
      });
    },
    [currentNetwork.chainId, dispatch, trackEvent]
  );

  const handleTransactionSimulationWait = (transactions?: TransactionStep[], response?: BlowfishResponse) => {
    if (!transactions?.length) {
      return;
    }

    const newSteps = [...transactions];

    let index = findIndex(transactions, { type: TRANSACTION_ACTION_WAIT_FOR_SIMULATION });

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
    }

    index = findIndex(transactions, { type: TRANSACTION_ACTION_WAIT_FOR_QUOTES_SIMULATION });

    if (index !== -1) {
      newSteps[index] = {
        ...newSteps[index],
        done: true,
        failed: !response,
        checkForPending: false,
        extraData: {
          ...(newSteps[index].extraData as TransactionActionWaitForQuotesSimulationData),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          simulation: response,
        },
      };

      setTransactionsToExecute(newSteps);
    }
  };

  const handleApproveTransactionConfirmed = React.useCallback(() => {
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
        return simulatePromise
          .then((blowfishResponse) => blowfishResponse && handleTransactionSimulationWait(newSteps, blowfishResponse))
          .catch(() => handleTransactionSimulationWait(newSteps));
      }
    }

    return null;
  }, [currentNetwork.chainId, selectedRoute, simulationService, transactionsToExecute, transferTo]);

  const handlePermit2Signed = React.useCallback(
    (transactions?: TransactionStep[]) => {
      if (!transactions?.length || !activeWallet) {
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

        if (
          newSteps[signIndex + 1] &&
          newSteps[signIndex + 1].type === TRANSACTION_ACTION_WAIT_FOR_QUOTES_SIMULATION &&
          selectedRoute &&
          selectedRoute.tx
        ) {
          const swapIndex = findIndex(transactions, { type: TRANSACTION_ACTION_SWAP });

          if (swapIndex !== -1) {
            const { signature } = newSteps[swapIndex].extraData as TransactionActionSwapData;

            if (signature) {
              const simulatePromise = simulationService.simulateQuotes(
                activeWallet.address,
                quotes,
                sorting,
                signature,
                (isBuyOrder && toValue && to && parseUnits(toValue, to.decimals)) || undefined
              );
              return simulatePromise
                .then((sortedQuotes) => {
                  if (!sortedQuotes.length) {
                    handleTransactionSimulationWait(newSteps);
                    setShouldShowFailedQuotesModal(true);
                    return null;
                  }
                  const originalQuote = find(sortedQuotes, { swapper: { id: selectedRoute.swapper.id } });
                  const isThereABetterQuote = sortedQuotes[0].swapper.id !== selectedRoute.swapper.id;
                  const isBetteryBy =
                    isThereABetterQuote &&
                    parseFloat(
                      formatCurrencyAmount(
                        getBetterBy(sortedQuotes[0], selectedRoute, sorting, isBuyOrder) || 0n,
                        emptyTokenWithDecimals(18),
                        3,
                        2
                      )
                    ).toFixed(3);

                  if (isThereABetterQuote && (Number(isBetteryBy) > 0 || !originalQuote)) {
                    dispatch(setSelectedRoute(originalQuote || { ...selectedRoute, willFail: true }));
                    setBetterQuote(sortedQuotes[0]);
                    setShouldShowBetterQuoteModal(true);
                  } else {
                    if (originalQuote) {
                      dispatch(setSelectedRoute(originalQuote));
                    }
                    handleTransactionSimulationWait(newSteps, {
                      action: 'NONE',
                      warnings: [],
                      simulationResults: {
                        expectedStateChanges: [
                          {
                            humanReadableDiff: intl.formatMessage(
                              { description: 'quoteSimulationSell', defaultMessage: 'Sell {amount} {token}' },
                              { amount: selectedRoute.sellAmount.amountInUnits, token: selectedRoute.sellToken.symbol }
                            ),
                            rawInfo: {
                              kind: StateChangeKind.ERC20_TRANSFER,
                              data: { amount: { before: '1', after: '0' }, asset: selectedRoute.sellToken },
                            },
                          },
                          {
                            humanReadableDiff: intl.formatMessage(
                              { description: 'quoteSimulationBuy', defaultMessage: 'Buy {amount} {token} on {target}' },
                              {
                                amount: selectedRoute.buyAmount.amountInUnits,
                                token: selectedRoute.buyToken.symbol,
                                target: selectedRoute.swapper.name,
                              }
                            ),
                            rawInfo: {
                              kind: StateChangeKind.ERC20_TRANSFER,
                              data: { amount: { before: '0', after: '1' }, asset: selectedRoute.buyToken },
                            },
                          },
                        ],
                      },
                    });
                  }

                  return null;
                })
                .catch((e) => {
                  console.error('Error simulating transactions', e);
                  handleTransactionSimulationWait(newSteps);
                });
            }
          }
        }
      }

      return null;
    },
    [dispatch, intl, isBuyOrder, quotes, selectedRoute, simulationService, sorting, to, toValue]
  );

  const handleSignPermit2Approval = React.useCallback(
    async (amount?: bigint) => {
      if (!from || !to || !selectedRoute || !amount || !activeWallet) return;

      try {
        trackEvent('Aggregator - Sign permi2Approval submitting', {
          source: selectedRoute.swapper.id,
          fromSteps: !!transactionsToExecute?.length,
        });
        const result = await permit2Service.getPermit2SignedData(activeWallet.address, from, amount);
        trackEvent('Aggregator - Sign permi2Approval submitted', {
          source: selectedRoute.swapper.id,
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

          const swapIndex = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_SWAP });

          if (swapIndex !== -1) {
            newSteps[swapIndex] = {
              ...newSteps[swapIndex],
              extraData: {
                ...(newSteps[swapIndex].extraData as unknown as TransactionActionSwapData),
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
          trackEvent('Aggregator - Sign permi2Approval error', {
            source: selectedRoute.swapper.id,
            fromSteps: !!transactionsToExecute?.length,
          });
          // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          void errorService.logError('Error signing permi2Approval aggregator', JSON.stringify(e), {
            swapper: selectedRoute.swapper.id,
            chainId: currentNetwork.chainId,
            from: selectedRoute.sellToken.address,
            to: selectedRoute.buyToken.address,
            buyAmount: selectedRoute.buyAmount.amountInUnits,
            sellAmount: selectedRoute.sellAmount.amountInUnits,
            type: selectedRoute.type,
          });
        } else {
          setModalClosed({});
        }
      }
    },
    [
      currentNetwork.chainId,
      errorService,
      from,
      handlePermit2Signed,
      permit2Service,
      selectedRoute,
      setModalClosed,
      to,
      trackEvent,
      transactionsToExecute,
    ]
  );

  const buildSteps = () => {
    if (!from || fromValueToUse === '' || !to || !selectedRoute) {
      return [];
    }

    const newSteps: TransactionStep[] = [];

    let amountToApprove = parseUnits(fromValueToUse, from.decimals);

    if (isBuyOrder && selectedRoute) {
      const maxBetweenQuotes = quotes.reduce<bigint>(
        (acc, quote) => (acc <= quote.maxSellAmount.amount ? quote.maxSellAmount.amount : acc),
        0n
      );

      amountToApprove = maxBetweenQuotes;
    }

    if (!isApproved) {
      newSteps.push({
        hash: '',
        onAction: (amount) => handleApproveToken(amount),
        checkForPending: false,
        done: false,
        type: TRANSACTION_ACTION_APPROVE_TOKEN,
        explanation: isPermit2Enabled
          ? intl.formatMessage(
              defineMessage({
                description: 'approveTokenExplanation',
                defaultMessage:
                  'By enabling Universal Approval, you will be able to use Uniswap, Mean, swap aggregators and more protocols without having to authorize each one of them',
              })
            )
          : intl.formatMessage(
              defineMessage({
                description: 'approveTokenExplanationNoPermit2',
                defaultMessage:
                  'You need to explicitly allow {target} smart contracts to extract your {token} from your wallet to be able to be swapped',
              }),
              { target: selectedRoute.swapper.name, token: selectedRoute.sellToken.symbol }
            ),
        extraData: {
          token: from,
          amount: amountToApprove,
          swapper: isPermit2Enabled
            ? intl.formatMessage(
                defineMessage({
                  description: 'us',
                  defaultMessage: 'us',
                })
              )
            : selectedRoute.swapper.name,
          defaultApproval: isPermit2Enabled ? AllowanceType.max : AllowanceType.specific,
          isPermit2Enabled,
          help: intl.formatMessage(
            defineMessage({
              description: 'Allowance Tooltip',
              defaultMessage: 'You must give the {target} smart contracts permission to use your {symbol}',
            }),
            { target: isPermit2Enabled ? 'Universal Approval' : selectedRoute.swapper.name, symbol: from.symbol }
          ),
        },
      });

      newSteps.push({
        hash: '',
        onAction: (steps: TransactionAction[]) => handlePermit2Signed(steps),
        checkForPending: true,
        done: false,
        type: TRANSACTION_ACTION_WAIT_FOR_APPROVAL,
        extraData: {
          token: from,
          amount: amountToApprove,
        },
      });
    }

    if (isPermit2Enabled) {
      newSteps.push({
        hash: '',
        onAction: (amount) => handleSignPermit2Approval(amount),
        checkForPending: false,
        done: false,
        type: TRANSACTION_ACTION_APPROVE_TOKEN_SIGN,
        explanation: intl.formatMessage(
          defineMessage({
            description: 'permit2SignExplanation',
            defaultMessage: 'Mean now needs your explicit authorization to swap {tokenFrom} into {tokenTo}',
          }),
          { tokenFrom: from.symbol, tokenTo: to.symbol }
        ),
        extraData: {
          token: from,
          amount: amountToApprove,
          swapper: selectedRoute.swapper.name,
        },
      });

      newSteps.push({
        hash: '',
        onAction: (steps: TransactionAction[]) => handleTransactionSimulationWait(steps),
        checkForPending: true,
        done: false,
        type: TRANSACTION_ACTION_WAIT_FOR_QUOTES_SIMULATION,
        extraData: {
          quotes: quotes.length,
        },
      });
    } else if (BLOWFISH_ENABLED_CHAINS.includes(currentNetwork.chainId) && selectedRoute.tx) {
      newSteps.push({
        hash: '',
        onAction: (steps: TransactionAction[]) => handleTransactionSimulationWait(steps),
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
      onAction: () => handleSwap(),
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

    return newSteps;
  };

  const handleMultiSteps = () => {
    if (!from || fromValueToUse === '' || !to || !selectedRoute) {
      return;
    }

    const newSteps = buildSteps();

    trackEvent('Aggregator - Start swap steps', { isPermit2Enabled });
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

  const handleBackTransactionSteps = React.useCallback(() => {
    dispatch(setSelectedRoute(null));
    setRefreshQuotes(true);
    fetchOptions();
    setShouldShowSteps(false);
  }, [dispatch, fetchOptions]);

  const onSetFrom = React.useCallback(
    (newFrom: Token, updateMode = false) => {
      dispatch(setSelectedRoute(null));
      dispatch(setFromValue({ value: '', updateMode }));
      dispatch(setFrom(newFrom));
      replaceHistory(`/swap/${currentNetwork.chainId}/${newFrom.address}/${to?.address || ''}`);
      trackEvent('Aggregator - Set from', { fromAddress: newFrom?.address, toAddress: to?.address });
    },
    [currentNetwork.chainId, dispatch, to?.address]
  );

  const onSetTo = React.useCallback(
    (newTo: Token, updateMode = false) => {
      dispatch(setSelectedRoute(null));
      dispatch(setToValue({ value: '', updateMode }));
      dispatch(setTo(newTo));
      if (from?.address) {
        replaceHistory(`/swap/${currentNetwork.chainId}/${from.address || ''}/${newTo.address}`);
      }
      trackEvent('Aggregator - Set to', { fromAddress: newTo?.address, toAddress: from?.address });
    },
    [currentNetwork.chainId, dispatch, from?.address]
  );

  const handleTransactionConfirmationClose = React.useCallback(() => {
    onResetForm();
    setShouldShowConfirmation(false);
    setRefreshQuotes(true);
  }, [onResetForm, setShouldShowConfirmation]);

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
      case TRANSACTION_ACTION_WAIT_FOR_SIMULATION:
        return handleTransactionSimulationWait;
      case TRANSACTION_ACTION_WAIT_FOR_QUOTES_SIMULATION:
        return handleTransactionSimulationWait;
      case TRANSACTION_ACTION_SWAP:
        return handleSwap;
      default:
        return () => {};
    }
  }, [currentTransactionStep]);

  const onTokenPickerClose = React.useCallback(() => {
    setShouldShowPicker(false);
  }, []);

  const tokenPickerOnChange = React.useMemo(
    () => (from?.address === selecting.address || selecting.address === 'from' ? onSetFrom : onSetTo),
    [onSetFrom, onSetTo, selecting.address]
  );

  const onShowSettings = React.useCallback(() => {
    setShouldShowSettings(true);
  }, []);

  const tokenPickerModalTitle = selecting === from ? sellMessage : receiveMessage;

  return (
    <>
      <TransferToModal
        transferTo={transferTo}
        onCancel={() => setShouldShowTransferModal(false)}
        open={shouldShowTransferModal}
      />
      <BetterQuoteModal
        selectedRoute={selectedRoute}
        betterQuote={betterQuote}
        onCancel={() => setShouldShowBetterQuoteModal(false)}
        onGoBack={handleBackTransactionSteps}
        open={shouldShowBetterQuoteModal}
        onSelectBetterQuote={(response: BlowfishResponse) =>
          handleTransactionSimulationWait(transactionsToExecute, response)
        }
      />
      <FailedQuotesModal
        onCancel={() => setShouldShowFailedQuotesModal(false)}
        onGoBack={handleBackTransactionSteps}
        open={shouldShowFailedQuotesModal}
      />
      <StyledPaper variant="outlined" ref={containerRef}>
        <SwapSettings shouldShow={shouldShowSettings} onClose={() => setShouldShowSettings(false)} />
        <TransactionConfirmation
          to={to}
          from={from}
          shouldShow={shouldShowConfirmation}
          transaction={currentTransaction}
          handleClose={handleTransactionConfirmationClose}
        />
        <TransactionSteps
          shouldShow={shouldShowSteps}
          handleClose={handleBackTransactionSteps}
          transactions={transactionsToExecute}
          onAction={transactionOnAction}
        />
        <TokenPickerModal
          shouldShow={shouldShowPicker}
          onClose={onTokenPickerClose}
          modalTitle={tokenPickerModalTitle}
          onChange={tokenPickerOnChange}
          isLoadingYieldOptions={false}
          onAddToken={addCustomTokenToList}
          account={activeWallet?.address}
          allowCustomTokens
          allowAllTokens
          showWrappedAndProtocol
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
              onShowSettings={onShowSettings}
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

// Swap.whyDidYouRender = true;
export default React.memo(Swap);
