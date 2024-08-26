// eslint-enable react-hooks/exhaustive-deps
import React from 'react';
import useTransactionService from './useTransactionService';
import { TokenListId, TransactionDetails, TransactionEvent } from 'common-types';
import { isEqual, sortedIndexBy } from 'lodash';
import { useAppDispatch } from '@state/hooks';
import { useIsLoadingAllTokenLists } from '@state/token-lists/hooks';
import { useTransactions } from '@state/transactions/hooks';
import { cleanTransactions } from '@state/transactions/actions';
import {
  parseMultipleTransactionApiEventsToTransactionEvents,
  transformNonIndexedEvents,
} from '@common/utils/transaction-history/parsing';
import useWallets from './useWallets';
import useTokenList from './useTokenList';
import { useStoredNativePrices } from '@state/balances/hooks';
import useStoredTransactionHistory from './useStoredTransactionHistory';
import { getTransactionInvolvedTokens } from '@common/utils/transaction-history';
import { getTokenListId } from '@common/utils/parsing';

function useTransactionsHistory(tokens?: TokenListId[]): {
  events: TransactionEvent[];
  fetchMore: () => Promise<void>;
  isLoading: boolean;
} {
  const transactionService = useTransactionService();
  const [isHookLoading, setIsHookLoading] = React.useState(false);
  const { isLoading: isLoadingService, history, globalPagination, tokenPagination } = useStoredTransactionHistory();

  const storedWallets = useWallets();
  const historyEvents = history?.events;
  const hasMoreEvents = React.useMemo(
    () => globalPagination.moreEvents && (!tokens || tokenPagination.moreEvents),
    [globalPagination.moreEvents, tokenPagination.moreEvents, tokens]
  );
  const lastEventTimestamp = React.useMemo(
    () => (!!tokens ? tokenPagination.lastEventTimestamp : globalPagination.lastEventTimestamp),
    [globalPagination.lastEventTimestamp, tokenPagination.lastEventTimestamp, tokens]
  );
  const indexing = React.useMemo(() => history?.indexing, [history]);
  const isLoadingTokenLists = useIsLoadingAllTokenLists();
  const dispatch = useAppDispatch();
  const [parsedEvents, setParsedEvents] = React.useState<TransactionEvent[]>([]);
  const isLoading = isHookLoading || isLoadingService;
  const tokenList = useTokenList({});
  const localTransactions = useTransactions();

  const chainsWithNativePrice = React.useMemo(() => localTransactions.map((tx) => tx.chainId), [localTransactions]);
  const nativePrices = useStoredNativePrices(chainsWithNativePrice);

  React.useEffect(() => {
    if (!isLoadingTokenLists && historyEvents && !isLoading) {
      const resolvedEvents = parseMultipleTransactionApiEventsToTransactionEvents(
        historyEvents,
        tokenList,
        storedWallets.map(({ address }) => address)
      );

      const { indexedTransactions, nonIndexedTransactions } = localTransactions.reduce<{
        indexedTransactions: { chainId: number; hash: string }[];
        nonIndexedTransactions: TransactionDetails[];
      }>(
        (acc, tx) => {
          const isIndexed = resolvedEvents.some(
            (serviceEvent) =>
              serviceEvent.tx.chainId === tx.chainId && serviceEvent.tx.txHash.toLowerCase() === tx.hash.toLowerCase()
          );
          if (isIndexed) {
            acc.indexedTransactions.push({ chainId: tx.chainId, hash: tx.hash });
          } else {
            acc.nonIndexedTransactions.push(tx);
          }
          return acc;
        },
        { indexedTransactions: [], nonIndexedTransactions: [] }
      );

      const nonIndexedEvents = transformNonIndexedEvents({
        events: nonIndexedTransactions,
        userWallets: storedWallets.map(({ address }) => address),
        tokenList,
        nativePrices,
      });

      nonIndexedEvents.forEach((tx) => {
        const insertionIndex = sortedIndexBy(resolvedEvents, tx, (storedEvent) => -storedEvent.tx.timestamp);
        resolvedEvents.splice(insertionIndex, 0, tx);
      });

      let resolvedFilteredEvents: TransactionEvent[] = [];

      if (!!tokens) {
        // For token history, return only token-related events
        resolvedFilteredEvents = resolvedEvents.filter(
          (tx) =>
            !tokens ||
            getTransactionInvolvedTokens(tx)
              .map((token) => getTokenListId({ chainId: token.chainId, tokenAddress: token.address }))
              .some((tokenId) => tokens.includes(tokenId))
        );
      } else if (lastEventTimestamp) {
        // For global history, return only events up to it's last fetched timestamp
        resolvedFilteredEvents = resolvedEvents.filter((tx) => tx.tx.timestamp >= lastEventTimestamp);
      }

      // This set parsed event is actually killing perf, making this hook re-render a thousand times infinitely
      // Haven't figure out just why this happens, as of right now this is a PATCH for it but not a definitive solution
      if (!isEqual(parsedEvents, resolvedFilteredEvents)) {
        setParsedEvents(resolvedFilteredEvents);
      }

      if (!!indexedTransactions.length) dispatch(cleanTransactions({ indexedTransactions }));
    }

    if (!historyEvents && parsedEvents.length !== 0) {
      setParsedEvents([]);
    }
    // Whenever the events, the token list or any pending transaction changes, we want to retrigger this
  }, [
    historyEvents,
    indexing,
    isLoadingTokenLists,
    isLoading,
    tokenList,
    localTransactions,
    storedWallets,
    nativePrices,
    lastEventTimestamp,
  ]);

  const fetchMore = React.useCallback(async () => {
    if (!isLoading && hasMoreEvents) {
      try {
        setIsHookLoading(true);
        await transactionService.fetchTransactionsHistory({
          isFetchMore: true,
          tokens,
        });
      } catch (e) {
        console.error('Error while fetching transactions', e);
      }
      setIsHookLoading(false);
    }
  }, [isLoading, hasMoreEvents, transactionService, tokens]);

  return React.useMemo(() => ({ events: parsedEvents, fetchMore, isLoading }), [parsedEvents, fetchMore, isLoading]);
}

export default useTransactionsHistory;
