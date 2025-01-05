import React from 'react';
import { Address, formatUnits, Hash, parseUnits } from 'viem';
import find from 'lodash/find';
import styled from 'styled-components';
import {
  ApproveTokenExactTypeData,
  ApproveTokenTypeData,
  BlowfishResponse,
  SignStatus,
  StateChangeKind,
  SwapOption,
  SwapOptionWithTx,
  SwapTypeData,
  Token,
  TransactionActionApproveTokenSignSwapData,
  TransactionActionSwapData,
  TransactionApplicationIdentifier,
  TransactionTypes,
} from '@types';
import { Typography, BackgroundPaper } from 'ui-library';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import findIndex from 'lodash/findIndex';
import {
  BLOWFISH_ENABLED_CHAINS,
  NETWORKS,
  PERMIT_2_ADDRESS,
  TRANSACTION_ACTION_APPROVE_TOKEN,
  TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_SWAP,
  TRANSACTION_ACTION_SWAP,
  TRANSACTION_ACTION_WAIT_FOR_SIMULATION,
} from '@constants';
import useTransactionModal from '@hooks/useTransactionModal';
import { formatCurrencyAmount, parseNumberUsdPriceToBigInt, parseUsdPrice } from '@common/utils/currency';
import { useTransactionAdder } from '@state/transactions/hooks';

import { getProtocolToken, getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useWalletService from '@hooks/useWalletService';
import useAggregatorService from '@hooks/useAggregatorService';
import useSpecificAllowance from '@hooks/useSpecificAllowance';
import TransactionConfirmation from '@common/components/transaction-confirmation';
import TransactionSteps, {
  TransactionAction,
  TransactionAction as TransactionStep,
} from '@common/components/transaction-steps';
import { useAppDispatch } from '@state/hooks';
import useSimulationService from '@hooks/useSimulationService';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { deserializeError, shouldTrackError } from '@common/utils/errors';
import useErrorService from '@hooks/useErrorService';
import useLoadedAsSafeApp from '@hooks/useLoadedAsSafeApp';
import useAnalytics from '@hooks/useAnalytics';
import { resetForm, setFrom, setFromValue, setSelectedRoute, setTo, setToValue } from '@state/aggregator/actions';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { useAggregatorState } from '@state/aggregator/hooks';
import usePermit2Service from '@hooks/usePermit2Service';
import useReplaceHistory from '@hooks/useReplaceHistory';
import useIsPermit2Enabled from '@hooks/useIsPermit2Enabled';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import SwapFirstStep from '../step1';
import SwapSettings from '../swap-settings';
import { QuoteStatus } from '../quote-status-notification';
import useActiveWallet from '@hooks/useActiveWallet';
import TokenPicker from '../token-picker';
import { usePortfolioPrices, useTokenBalance } from '@state/balances/hooks';
import { ContactListActiveModal } from '@common/components/contact-modal';
import TransferToModal from '../transfer-to-modal';
import { setSwapOptionMaxSellAmount } from '@common/utils/quotes';
import { compact } from 'lodash';

const StyledBackgroundPaper = styled(BackgroundPaper)<{ $showsCog: boolean }>`
  position: relative;
  overflow: hidden;
  ${({ theme: { space }, $showsCog }) => `
  padding: ${space.s07} ${space.s05} ${space.s06};
  ${!$showsCog && `padding-top: ${space.s06};`}
  `}
`;

const sellMessage = <FormattedMessage description="You sell" defaultMessage="You sell" />;
const receiveMessage = <FormattedMessage description="You receive" defaultMessage="You receive" />;

interface SwapProps {
  isLoadingRoute: boolean;
  quotes: SwapOption[];
  fetchOptions: () => void;
  swapOptionsError?: string;
  missingQuotes: string[];
  totalQuotes: number;
}

const Swap = ({ isLoadingRoute, quotes, fetchOptions, swapOptionsError, missingQuotes, totalQuotes }: SwapProps) => {
  const { fromValue, from, to, toValue, isBuyOrder, selectedRoute, transferTo } = useAggregatorState();
  const { sorting } = useAggregatorSettingsState();
  const dispatch = useAppDispatch();
  const currentNetwork = useSelectedNetwork();
  const isPermit2Enabled = useIsPermit2Enabled(currentNetwork.chainId);
  const intl = useIntl();
  const [shouldShowPicker, setShouldShowPicker] = React.useState(false);
  const [shouldShowConfirmation, setShouldShowConfirmation] = React.useState(false);
  const [shouldShowSettings, setShouldShowSettings] = React.useState(false);
  const [refreshQuotes, setRefreshQuotes] = React.useState(true);
  const errorService = useErrorService();
  const [shouldShowSteps, setShouldShowSteps] = React.useState(false);
  const [shouldShowFirstStep, setShouldShowFirstStep] = React.useState(true);
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const walletService = useWalletService();
  const aggregatorService = useAggregatorService();
  const [activeContactModal, setActiveContactModal] = React.useState<ContactListActiveModal>(
    ContactListActiveModal.NONE
  );
  const prices = usePortfolioPrices(compact([from, to]));
  const [currentQuoteStatus, setCurrentQuoteStatus] = React.useState(QuoteStatus.None);
  const protocolToken = getProtocolToken(currentNetwork.chainId);
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const [currentTransaction, setCurrentTransaction] = React.useState<{ hash: Hash; chainId: number } | undefined>();
  const [transactionsToExecute, setTransactionsToExecute] = React.useState<TransactionStep[]>([]);
  const simulationService = useSimulationService();
  const actualCurrentNetwork = useCurrentNetwork();
  const loadedAsSafeApp = useLoadedAsSafeApp();
  const { trackEvent } = useAnalytics();
  const replaceHistory = useReplaceHistory();
  const [selectingSelection, setSelectingSelection] = React.useState<'from' | 'to'>('from');
  const permit2Service = usePermit2Service();
  const activeWallet = useActiveWallet();
  const { balance: balanceFrom, isLoading: isLoadingFromBalance } = useTokenBalance({
    token: from,
    walletAddress: activeWallet?.address,
    shouldAutoFetch: true,
  });
  const { balance: balanceTo, isLoading: isLoadingToBalance } = useTokenBalance({
    token: to,
    walletAddress: activeWallet?.address,
    shouldAutoFetch: true,
  });

  const isOnCorrectNetwork = actualCurrentNetwork.chainId === currentNetwork.chainId;
  const [allowance, , allowanceErrors] = useSpecificAllowance(
    from,
    activeWallet?.address || '',
    isPermit2Enabled
      ? PERMIT_2_ADDRESS[currentNetwork.chainId] || PERMIT_2_ADDRESS[NETWORKS.mainnet.chainId]
      : selectedRoute?.swapper.allowanceTarget
  );

  const fromValueToUse =
    isBuyOrder && selectedRoute
      ? (selectedRoute?.sellToken.address === from?.address &&
          formatUnits(selectedRoute.sellAmount.amount, selectedRoute.sellToken.decimals)) ||
        '0.0'
      : fromValue;

  const toValueToUse = isBuyOrder
    ? toValue
    : (selectedRoute?.buyToken.address === to?.address &&
        formatUnits(selectedRoute?.buyAmount.amount || 0n, selectedRoute?.buyToken.decimals || 18)) ||
      '0.0' ||
      '';

  const formattedUnits =
    selectedRoute?.maxSellAmount.amount &&
    formatUnits(selectedRoute.maxSellAmount.amount, selectedRoute.sellToken.decimals);

  const cantFund =
    !!from &&
    isOnCorrectNetwork &&
    !!fromValueToUse &&
    !!balanceFrom &&
    parseUnits(formattedUnits || fromValueToUse, selectedRoute?.sellToken.decimals || from.decimals) >
      BigInt(balanceFrom.amount);

  const isApproved =
    !from ||
    !selectedRoute ||
    (from &&
      selectedRoute &&
      ((allowance.allowance &&
        allowance.token.address === from.address &&
        parseUnits(allowance.allowance, from.decimals) >= selectedRoute.maxSellAmount.amount) ||
        from.address === PROTOCOL_TOKEN_ADDRESS));

  const totalAmountToApprove = React.useMemo(() => {
    if (!quotes[0]) return;

    let amountToApprove = quotes[0].maxSellAmount.amount;

    if (isBuyOrder) {
      const maxBetweenQuotes = quotes.reduce<bigint>(
        (acc, quote) => (acc <= quote.maxSellAmount.amount ? quote.maxSellAmount.amount : acc),
        0n
      );

      amountToApprove = maxBetweenQuotes;
    }

    return amountToApprove;
  }, [quotes, isBuyOrder]);

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
            <Typography variant="bodyRegular">
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
          ? PERMIT_2_ADDRESS[currentNetwork.chainId] || PERMIT_2_ADDRESS[NETWORKS.mainnet.chainId]
          : selectedRoute.swapper.allowanceTarget;

        const result = await walletService.approveSpecificToken(
          from,
          addressToApprove as Address,
          activeWallet.address,
          amount
        );
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
              hash: result.hash,
              chainId: result.chainId,
            };
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            error: {
              ...deserializeError(e),
              extraData: {
                swapper: selectedRoute.swapper.id,
                chainId: currentNetwork.chainId,
                from: selectedRoute.sellToken.address,
                to: selectedRoute.buyToken.address,
                buyAmount: selectedRoute.buyAmount.amountInUnits,
                sellAmount: selectedRoute.sellAmount.amountInUnits,
                type: selectedRoute.type,
              },
            },
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
    if (!from || !to || !selectedRoute || !selectedRoute.tx || !totalAmountToApprove) return;
    const fromSymbol = from.symbol;
    const toSymbol = to.symbol;
    const fromAmount = formatCurrencyAmount({
      amount: selectedRoute.sellAmount.amount,
      token: from,
      sigFigs: 4,
      maxDecimals: 6,
      intl,
    });
    const toAmount = formatCurrencyAmount({
      amount: selectedRoute.buyAmount.amount,
      token: to,
      sigFigs: 4,
      maxDecimals: 6,
      intl,
    });
    try {
      setRefreshQuotes(false);

      setModalLoading({
        content: (
          <Typography variant="bodyRegular">
            <FormattedMessage description="swap agg loading" defaultMessage="Swapping" />
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
        balanceBefore = await walletService.getBalance({
          account: selectedRoute.transferTo || activeWallet?.address,
          token: protocolToken,
        });
      }

      trackEvent('Aggregator - Swap submitting', {
        source: selectedRoute.swapper.id,
        fromSteps: !!transactionsToExecute?.length,
        isPermit2Enabled,
      });
      const parsedSwapOption = setSwapOptionMaxSellAmount(selectedRoute, totalAmountToApprove);

      const result = await aggregatorService.swap(parsedSwapOption as SwapOptionWithTx);

      trackEvent('Aggregator - Swap submitted', {
        source: selectedRoute.swapper.id,
        fromSteps: !!transactionsToExecute?.length,
        isPermit2Enabled,
      });

      try {
        const fromUsdValueToUse =
          selectedRoute?.sellAmount.amountInUSD ||
          (fromValueToUse &&
            fromValueToUse !== '' &&
            from &&
            prices[from?.address] &&
            parseUsdPrice(
              from,
              parseUnits(fromValueToUse, from.decimals),
              parseNumberUsdPriceToBigInt(prices[from.address].price)
            )) ||
          undefined;
        const toUsdValueToUse =
          selectedRoute?.buyAmount.amountInUSD ||
          (toValueToUse &&
            toValueToUse !== '' &&
            to &&
            prices[to?.address] &&
            parseUsdPrice(
              to,
              parseUnits(toValueToUse, to.decimals),
              parseNumberUsdPriceToBigInt(prices[to.address].price)
            )) ||
          undefined;
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        trackEvent('Swap on aggregator', {
          swapper: selectedRoute.swapper.id,
          from: selectedRoute.sellToken.address,
          fromSymbol: selectedRoute.sellToken.symbol,
          to: selectedRoute.buyToken.address,
          toSymbol: selectedRoute.buyToken.symbol,
          buyAmount: selectedRoute.buyAmount.amountInUnits,
          sellAmount: selectedRoute.sellAmount.amountInUnits,
          buyAmountUsd: toUsdValueToUse,
          sellAmountUsd: fromUsdValueToUse,
          type: selectedRoute.type,
          isPermit2Enabled,
        });
      } catch (e) {
        console.error('Error tracking through mixpanel', e);
      }

      const baseTransactionData = {
        from,
        to,
        amountFrom: selectedRoute.sellAmount.amount,
        amountTo: selectedRoute.buyAmount.amount,
        amountFromUsd: Number(selectedRoute.sellAmount.amountInUSD ?? 0),
        amountToUsd: Number(selectedRoute.buyAmount.amountInUSD ?? 0),
        balanceBefore: (balanceBefore && balanceBefore?.toString()) || null,
        transferTo,
        orderType: selectedRoute.type,
        swapContract: selectedRoute.tx.to,
      };

      const transactionTypeData: SwapTypeData = {
        type: TransactionTypes.swap,
        typeData: baseTransactionData,
      };

      addTransaction(result, transactionTypeData);

      setShouldShowFirstStep(false);
      setShouldShowSteps(false);
      setModalClosed({ content: '' });
      setCurrentTransaction({
        hash: result.hash,
        chainId: result.chainId,
      });
      setShouldShowConfirmation(true);

      // Scroll to top of page
      window.scrollTo(0, 0);

      if (transactionsToExecute?.length) {
        const newSteps = [...transactionsToExecute];

        const index = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_SWAP });

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

        const swapIndex = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_SWAP });
        let signature;
        let signatureData;
        if (swapIndex !== -1) {
          signature = (transactionsToExecute[swapIndex].extraData as TransactionActionSwapData).signature;
          signatureData = await permit2Service.getPermit2SignatureInfo(
            activeWallet!.address,
            from,
            BigInt(selectedRoute.sellAmount.amount)
          );
        }

        /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        setModalError({
          content: 'Error swapping',
          error: {
            ...deserializeError(e),
            extraData: {
              swapper: selectedRoute.swapper.id,
              chainId: currentNetwork.chainId,
              from: selectedRoute.sellToken.address,
              to: selectedRoute.buyToken.address,
              buyAmount: selectedRoute.buyAmount.amountInUnits,
              sellAmount: selectedRoute.sellAmount.amountInUnits,
              type: selectedRoute.type,
              isPermit2Enabled,
              signature,
              signatureData,
            },
          },
        });
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
    totalAmountToApprove,
  ]);

  const handleSafeApproveAndSwap = async () => {
    if (!from || !to || !selectedRoute || !selectedRoute.tx || !loadedAsSafeApp) return;
    const fromSymbol = from.symbol;
    const toSymbol = to.symbol;
    const fromAmount = formatCurrencyAmount({
      amount: selectedRoute.sellAmount.amount,
      token: from,
      sigFigs: 4,
      maxDecimals: 6,
      intl,
    });
    const toAmount = formatCurrencyAmount({
      amount: selectedRoute.buyAmount.amount,
      token: to,
      sigFigs: 4,
      maxDecimals: 6,
      intl,
    });
    try {
      setRefreshQuotes(false);

      setModalLoading({
        content: (
          <Typography variant="bodyRegular">
            <FormattedMessage description="swap agg loading" defaultMessage="Swapping" />
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
        balanceBefore = await walletService.getBalance({
          account: activeWallet?.address,
          token: protocolToken,
        });
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
        const fromUsdValueToUse =
          selectedRoute?.sellAmount.amountInUSD ||
          (fromValueToUse &&
            fromValueToUse !== '' &&
            from &&
            prices[from?.address] &&
            parseUsdPrice(
              from,
              parseUnits(fromValueToUse, from.decimals),
              parseNumberUsdPriceToBigInt(prices[from.address].price)
            )) ||
          undefined;
        const toUsdValueToUse =
          selectedRoute?.buyAmount.amountInUSD ||
          (toValueToUse &&
            toValueToUse !== '' &&
            to &&
            prices[to?.address] &&
            parseUsdPrice(
              to,
              parseUnits(toValueToUse, to.decimals),
              parseNumberUsdPriceToBigInt(prices[to.address].price)
            )) ||
          undefined;
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        trackEvent('Swap on aggregator', {
          swapper: selectedRoute.swapper.id,
          from: selectedRoute.sellToken.address,
          fromSymbol: selectedRoute.sellToken.symbol,
          to: selectedRoute.buyToken.address,
          toSymbol: selectedRoute.buyToken.symbol,
          buyAmount: selectedRoute.buyAmount.amountInUnits,
          sellAmount: selectedRoute.sellAmount.amountInUnits,
          buyAmountUsd: toUsdValueToUse,
          sellAmountUsd: fromUsdValueToUse,
          type: selectedRoute.type,
        });
      } catch (e) {
        console.error('Error tracking through mixpanel', e);
      }

      const baseTransactionData = {
        from,
        to,
        amountFrom: selectedRoute.sellAmount.amount,
        amountTo: selectedRoute.buyAmount.amount,
        amountFromUsd: Number(selectedRoute.sellAmount.amountInUSD ?? 0),
        amountToUsd: Number(selectedRoute.buyAmount.amountInUSD ?? 0),
        balanceBefore: (balanceBefore && balanceBefore?.toString()) || null,
        transferTo,
        orderType: selectedRoute.type,
        swapContract: selectedRoute.tx.to,
      };

      const transactionTypeData: SwapTypeData = {
        type: TransactionTypes.swap,
        typeData: baseTransactionData,
      };

      addTransaction(
        {
          hash: result.safeTxHash as Address,
          from: (selectedRoute as SwapOptionWithTx).tx.from as Address,
          chainId: selectedRoute.chainId,
        },
        transactionTypeData
      );

      setShouldShowFirstStep(false);
      setShouldShowSteps(false);
      setModalClosed({ content: '' });
      setCurrentTransaction({
        hash: result.safeTxHash as Hash,
        chainId: selectedRoute.chainId,
      });
      setShouldShowConfirmation(true);

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
        setModalError({
          content: 'Error swapping',
          error: {
            ...deserializeError(e),
            extraData: {
              swapper: selectedRoute.swapper.id,
              chainId: currentNetwork.chainId,
              from: selectedRoute.sellToken.address,
              to: selectedRoute.buyToken.address,
              buyAmount: selectedRoute.buyAmount.amountInUnits,
              sellAmount: selectedRoute.sellAmount.amountInUnits,
              type: selectedRoute.type,
            },
          },
        });
      } else {
        setModalClosed({});
      }
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setRefreshQuotes(true);
    }
  };

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

    index = findIndex(transactions, { type: TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_SWAP });

    if (index !== -1) {
      newSteps[index] = {
        ...newSteps[index],
        done: !!response,
        failed: !response,
        checkForPending: false,
        extraData: {
          ...(newSteps[index].extraData as TransactionActionApproveTokenSignSwapData),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          simulation: response,
        },
      };

      setTransactionsToExecute(newSteps);
    }
  };

  const handleApproveTransactionConfirmed = React.useCallback(
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
    },
    [currentNetwork.chainId, selectedRoute, simulationService, transactionsToExecute, transferTo]
  );

  const handlePermit2Signed = React.useCallback(
    (transactions?: TransactionStep[]) => {
      if (!transactions?.length || !activeWallet) {
        return Promise.resolve(null);
      }

      const newSteps = [...transactions];

      const signIndex = findIndex(transactions, { type: TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_SWAP });

      if (signIndex !== -1 && selectedRoute) {
        const swapIndex = findIndex(transactions, { type: TRANSACTION_ACTION_SWAP });

        if (swapIndex !== -1) {
          const { signature } = newSteps[swapIndex].extraData as TransactionActionSwapData;

          if (signature) {
            const simulatePromise = simulationService.simulateQuotes({
              user: activeWallet.address,
              quotes,
              sorting,
              chainId: currentNetwork.chainId,
              signature,
              minimumReceived: (isBuyOrder && toValue && to && parseUnits(toValue, to.decimals)) || undefined,
              totalAmountToApprove,
            });
            return simulatePromise
              .then((sortedQuotes) => {
                if (!sortedQuotes.length) {
                  handleTransactionSimulationWait(newSteps);
                  setCurrentQuoteStatus(QuoteStatus.AllFailed);
                  return null;
                }
                const originalQuote = find(sortedQuotes, { swapper: { id: selectedRoute.swapper.id } });
                const isThereABetterQuote = sortedQuotes[0].swapper.id !== selectedRoute.swapper.id;

                let quoteDefinedForSwap: SwapOption;
                if (!originalQuote) {
                  quoteDefinedForSwap = sortedQuotes[0];
                  setCurrentQuoteStatus(QuoteStatus.OriginalFailed);
                } else if (isThereABetterQuote) {
                  quoteDefinedForSwap = sortedQuotes[0];
                  setCurrentQuoteStatus(QuoteStatus.BetterQuote);
                } else {
                  quoteDefinedForSwap = originalQuote;
                }

                newSteps[signIndex] = {
                  ...newSteps[signIndex],
                  extraData: {
                    ...(newSteps[signIndex].extraData as TransactionActionApproveTokenSignSwapData),
                    swapper: quoteDefinedForSwap.swapper.name,
                    fromAmount: quoteDefinedForSwap.sellAmount.amount,
                    toAmount: quoteDefinedForSwap.buyAmount.amount,
                  },
                } as TransactionAction;

                handleTransactionSimulationWait(newSteps, {
                  action: 'NONE',
                  warnings: [],
                  simulationResults: {
                    expectedStateChanges: [
                      {
                        humanReadableDiff: intl.formatMessage(
                          { description: 'quoteSimulationSell', defaultMessage: 'Sell {amount} {token}' },
                          {
                            amount: formatCurrencyAmount({
                              amount: quoteDefinedForSwap.sellAmount.amount,
                              token: quoteDefinedForSwap.sellToken,
                              intl,
                            }),
                            token: quoteDefinedForSwap.sellToken.symbol,
                          }
                        ),
                        rawInfo: {
                          kind: StateChangeKind.ERC20_TRANSFER,
                          data: { amount: { before: '1', after: '0' }, asset: quoteDefinedForSwap.sellToken },
                        },
                      },
                      {
                        humanReadableDiff: intl.formatMessage(
                          { description: 'quoteSimulationBuy', defaultMessage: 'Buy {amount} {token} on {target}' },
                          {
                            amount: formatCurrencyAmount({
                              amount: quoteDefinedForSwap.buyAmount.amount,
                              token: quoteDefinedForSwap.buyToken,
                              intl,
                            }),
                            token: quoteDefinedForSwap.buyToken.symbol,
                            target: quoteDefinedForSwap.swapper.name,
                          }
                        ),
                        rawInfo: {
                          kind: StateChangeKind.ERC20_TRANSFER,
                          data: { amount: { before: '0', after: '1' }, asset: quoteDefinedForSwap.buyToken },
                        },
                      },
                    ],
                  },
                });

                dispatch(setSelectedRoute(quoteDefinedForSwap));

                return null;
              })
              .catch((e) => {
                console.error('Error simulating transactions', e);
                handleTransactionSimulationWait(newSteps);
                setCurrentQuoteStatus(QuoteStatus.AllFailed);
              });
          }
        }
      }

      return null;
    },
    [dispatch, intl, isBuyOrder, quotes, selectedRoute, simulationService, sorting, to, toValue, totalAmountToApprove]
  );

  const handleSignPermit2Approval = React.useCallback(
    async (amount?: bigint) => {
      if (!from || !to || !selectedRoute || !amount || !activeWallet || !totalAmountToApprove) return;

      try {
        trackEvent('Aggregator - Sign permi2Approval submitting', {
          source: selectedRoute.swapper.id,
          fromSteps: !!transactionsToExecute?.length,
        });

        const result = await permit2Service.getPermit2SignedData(activeWallet.address, from, totalAmountToApprove);
        trackEvent('Aggregator - Sign permi2Approval submitted', {
          source: selectedRoute.swapper.id,
          fromSteps: !!transactionsToExecute?.length,
        });

        if (transactionsToExecute?.length) {
          const newSteps = [...transactionsToExecute];

          const approveIndex = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_SWAP });

          if (approveIndex !== -1) {
            newSteps[approveIndex] = {
              ...newSteps[approveIndex],
              extraData: {
                ...(newSteps[approveIndex].extraData as unknown as TransactionActionApproveTokenSignSwapData),
                signStatus: SignStatus.signed,
              },
            } as TransactionAction;
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

        if (transactionsToExecute?.length) {
          const newSteps = [...transactionsToExecute];

          const approveIndex = findIndex(transactionsToExecute, { type: TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_SWAP });

          if (approveIndex !== -1) {
            newSteps[approveIndex] = {
              ...newSteps[approveIndex],
              extraData: {
                ...(newSteps[approveIndex].extraData as unknown as TransactionActionApproveTokenSignSwapData),
                signStatus: SignStatus.failed,
              },
            } as TransactionAction;
          }

          setTransactionsToExecute(newSteps);
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
      totalAmountToApprove,
    ]
  );

  const buildSteps = () => {
    if (!from || fromValueToUse === '' || !to || !selectedRoute || !totalAmountToApprove) {
      return [];
    }

    const newSteps: TransactionStep[] = [];

    if (!isApproved) {
      newSteps.push({
        hash: '',
        chainId: currentNetwork.chainId,
        onAction: (amount) => handleApproveToken(amount),
        onActionConfirmed: (hash) => handleApproveTransactionConfirmed(hash),
        checkForPending: false,
        done: false,
        type: TRANSACTION_ACTION_APPROVE_TOKEN,
        explanation: isPermit2Enabled
          ? intl.formatMessage(
              defineMessage({
                description: 'approveTokenExplanation',
                defaultMessage:
                  'By enabling Universal Approval, you will be able to use Uniswap, Balmy, swap aggregators and more protocols without having to authorize each one of them',
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
          amount: totalAmountToApprove,
          swapper: isPermit2Enabled
            ? intl.formatMessage(
                defineMessage({
                  description: 'us',
                  defaultMessage: 'us',
                })
              )
            : selectedRoute.swapper.name,
          isPermit2Enabled,
        },
      });
    }

    if (isPermit2Enabled) {
      newSteps.push({
        hash: '',
        chainId: currentNetwork.chainId,
        onAction: (amount) => handleSignPermit2Approval(amount),
        checkForPending: false,
        done: false,
        type: TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_SWAP,
        explanation: intl.formatMessage(
          defineMessage({
            description: 'permit2SignExplanation',
            defaultMessage: 'Balmy now needs your explicit authorization to swap {tokenFrom} into {tokenTo}',
          }),
          { tokenFrom: from.symbol, tokenTo: to.symbol }
        ),
        extraData: {
          from,
          to,
          fromAmount: parseUnits(fromValueToUse, from.decimals),
          toAmount: parseUnits(toValueToUse, to.decimals),
          swapper: selectedRoute.swapper.name,
          signStatus: SignStatus.none,
        },
      });
    } else if (BLOWFISH_ENABLED_CHAINS.includes(currentNetwork.chainId) && selectedRoute.tx) {
      newSteps.push({
        hash: '',
        chainId: currentNetwork.chainId,
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
      chainId: currentNetwork.chainId,
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

    // Scroll to top of page
    window.scrollTo(0, 0);
    const newSteps = buildSteps();

    trackEvent('Aggregator - Start swap steps', { isPermit2Enabled });
    setTransactionsToExecute(newSteps);
    setRefreshQuotes(false);
    setShouldShowSteps(true);
  };

  const startSelectingCoin = (token: Token, selection: 'from' | 'to') => {
    setSelectingSelection(selection);
    setShouldShowPicker(true);
    trackEvent('Aggregator - start selecting coin', {
      selected: token.address,
      is: selection,
    });
  };

  const handleBackTransactionSteps = React.useCallback(() => {
    dispatch(setSelectedRoute(null));
    setRefreshQuotes(true);
    fetchOptions();
    setShouldShowSteps(false);
    setShouldShowFirstStep(true);
    setCurrentQuoteStatus(QuoteStatus.None);
    trackEvent('Aggregator - Back from steps');
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
    trackEvent('Aggreator - Make a new trade');
  }, [onResetForm, setShouldShowConfirmation]);

  const currentTransactionStep = React.useMemo(() => {
    const foundStep = find(transactionsToExecute, { done: false });
    return foundStep?.type || null;
  }, [transactionsToExecute]);

  const transactionOnAction = React.useMemo(() => {
    switch (currentTransactionStep) {
      case TRANSACTION_ACTION_APPROVE_TOKEN_SIGN_SWAP:
        return { onAction: handleSignPermit2Approval };
      case TRANSACTION_ACTION_APPROVE_TOKEN:
        return { onAction: handleApproveToken, onActionConfirmed: handleApproveTransactionConfirmed };
      case TRANSACTION_ACTION_WAIT_FOR_SIMULATION:
        return { onAction: handleTransactionSimulationWait };
      case TRANSACTION_ACTION_SWAP:
        return { onAction: handleSwap };
      default:
        return { onAction: () => {} };
    }
  }, [currentTransactionStep]);

  const onTokenPickerClose = React.useCallback(() => {
    setShouldShowPicker(false);
  }, []);

  const tokenPickerOnChange = React.useMemo(
    () => (selectingSelection === 'from' ? onSetFrom : onSetTo),
    [onSetFrom, onSetTo, from, selectingSelection]
  );

  const onShowSettings = React.useCallback(() => {
    setShouldShowSettings(true);
    trackEvent('Aggregator - Open swap settings');
  }, []);

  const tokenPickerModalTitle = selectingSelection === 'from' ? sellMessage : receiveMessage;

  const handleNewTrade = () => {
    trackEvent('Aggregator - New trade');
    dispatch(resetForm());
    handleTransactionConfirmationClose();
    setShouldShowFirstStep(true);
  };

  return (
    <>
      <TransferToModal activeContactModal={activeContactModal} setActiveContactModal={setActiveContactModal} />
      <StyledBackgroundPaper variant="outlined" $showsCog={!shouldShowConfirmation && !shouldShowSteps}>
        <SwapSettings
          shouldShow={shouldShowSettings}
          onClose={() => setShouldShowSettings(false)}
          setShouldShowFirstStep={setShouldShowFirstStep}
        />
        <TransactionConfirmation
          to={to}
          from={from}
          shouldShow={shouldShowConfirmation}
          transaction={currentTransaction}
          showWalletBalanceChanges
          successTitle={intl.formatMessage(
            defineMessage({ description: 'transactionConfirmationBalanceChanges', defaultMessage: 'Trade confirmed' })
          )}
          loadingTitle={intl.formatMessage(
            defineMessage({
              description: 'transactionConfirmationAggregatorLoadingTitle',
              defaultMessage: 'Swapping...',
            })
          )}
          loadingSubtitle={intl.formatMessage(
            defineMessage({
              description: 'transactionConfirmationAggregatorLoadingSubTitle',
              defaultMessage: 'You are swapping {valueFrom} {from} for {valueTo} {to}.',
            }),
            {
              valueFrom:
                selectedRoute && from
                  ? formatCurrencyAmount({
                      amount: selectedRoute.sellAmount.amount,
                      token: from,
                      sigFigs: 4,
                      maxDecimals: 6,
                      intl,
                    })
                  : '',
              from: from?.symbol || selectedRoute?.sellToken.symbol || '',
              valueTo:
                selectedRoute && to
                  ? formatCurrencyAmount({
                      amount: selectedRoute.buyAmount.amount,
                      token: to,
                      sigFigs: 4,
                      maxDecimals: 6,
                      intl,
                    })
                  : '',
              to: to?.symbol || selectedRoute?.buyToken.symbol || '',
            }
          )}
          actions={[
            {
              variant: 'contained',
              color: 'primary',
              onAction: handleNewTrade,
              label: intl.formatMessage({
                description: 'transactionConfirmationNewTrade',
                defaultMessage: 'New trade',
              }),
            },
          ]}
          txIdentifierForSatisfaction={TransactionApplicationIdentifier.SWAP}
        />
        <TransactionSteps
          shouldShow={shouldShowSteps}
          handleClose={handleBackTransactionSteps}
          transactions={transactionsToExecute}
          onAction={transactionOnAction.onAction}
          onActionConfirmed={transactionOnAction.onActionConfirmed}
          applicationIdentifier={TransactionApplicationIdentifier.SWAP}
          swapQuoteStatus={currentQuoteStatus}
          setShouldShowFirstStep={setShouldShowFirstStep}
        />
        <TokenPicker
          shouldShow={shouldShowPicker}
          onClose={onTokenPickerClose}
          modalTitle={tokenPickerModalTitle}
          onChange={tokenPickerOnChange}
        />
        {shouldShowFirstStep && (
          <SwapFirstStep
            from={from}
            to={to}
            toValue={toValueToUse}
            startSelectingCoin={startSelectingCoin}
            cantFund={cantFund}
            balanceFrom={balanceFrom}
            balanceTo={balanceTo}
            isLoadingFromBalance={isLoadingFromBalance}
            isLoadingToBalance={isLoadingToBalance}
            selectedRoute={selectedRoute}
            isBuyOrder={isBuyOrder}
            isLoadingRoute={isLoadingRoute}
            transferTo={transferTo}
            setActiveContactModal={setActiveContactModal}
            onShowSettings={onShowSettings}
            isApproved={isApproved}
            fromValue={fromValue}
            quotes={quotes}
            fetchOptions={fetchOptions}
            refreshQuotes={refreshQuotes}
            swapOptionsError={swapOptionsError}
            allowanceErrors={allowanceErrors}
            handleMultiSteps={handleMultiSteps}
            handleSwap={handleSwap}
            handleSafeApproveAndSwap={handleSafeApproveAndSwap}
            totalQuotes={totalQuotes}
            missingQuotes={missingQuotes}
          />
        )}
      </StyledBackgroundPaper>
    </>
  );
};

// Swap.whyDidYouRender = true;
export default React.memo(Swap);
