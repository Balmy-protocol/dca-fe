// eslint-enable react-hooks/exhaustive-deps
import React from 'react';
import useTransactionService from './useTransactionService';
import { TransactionEvent } from 'common-types';
import { isEqual } from 'lodash';
import { useAppDispatch } from '@state/hooks';
import { useIsLoadingAllTokenLists } from '@state/token-lists/hooks';
import { useTransactionsAfterBlockNumber } from '@state/transactions/hooks';
import { cleanTransactions } from '@state/transactions/actions';
import {
  parseMultipleTransactionApiEventsToTransactionEvents,
  transformNonIndexedEvents,
} from '@common/utils/transaction-history/parsing';
import useWallets from './useWallets';
import useTokenList from './useTokenList';
import { useStoredNativePrices } from '@state/balances/hooks';
import useStoredTransactionHistory from './useStoredTransactionHistory';

function useTransactionsHistory(): {
  events: TransactionEvent[];
  fetchMore: () => Promise<void>;
  isLoading: boolean;
} {
  const transactionService = useTransactionService();
  const [isHookLoading, setIsHookLoading] = React.useState(false);
  const { isLoading: isLoadingService, history } = useStoredTransactionHistory();

  const storedWallets = useWallets();
  const historyEvents = history?.events;
  const lastEventTimestamp = React.useMemo(
    () => historyEvents && historyEvents[historyEvents.length - 1]?.tx.timestamp,
    [historyEvents]
  );
  const hasMoreEvents = React.useMemo(() => history?.pagination.moreEvents, [history]);
  const indexing = React.useMemo(() => history?.indexing, [history]);
  const isLoadingTokenLists = useIsLoadingAllTokenLists();
  const dispatch = useAppDispatch();
  const [parsedEvents, setParsedEvents] = React.useState<TransactionEvent[]>([]);
  const isLoading = isHookLoading || isLoadingService;
  const tokenList = useTokenList({});
  const nonIndexedTransactions = useTransactionsAfterBlockNumber(indexing);

  const chainsWithNativePrice = React.useMemo(
    () => nonIndexedTransactions.map((tx) => tx.chainId),
    [nonIndexedTransactions]
  );
  const nativePrices = useStoredNativePrices(chainsWithNativePrice);

  React.useEffect(() => {
    if (!isLoadingTokenLists && historyEvents && !isLoading) {
      const resolvedEvents = parseMultipleTransactionApiEventsToTransactionEvents(
        historyEvents,
        tokenList,
        storedWallets.map(({ address }) => address)
      );

      const nonIndexedEvents = transformNonIndexedEvents({
        events: nonIndexedTransactions,
        userWallets: storedWallets.map(({ address }) => address),
        tokenList,
        nativePrices,
      });

      resolvedEvents.unshift(...nonIndexedEvents);

      // This set parsed event is actually killing perf, making this hook re-render a thousand times infinitely
      // Haven't figure out just why this happens, as of right now this is a PATCH for it but not a definitive solution
      if (!isEqual(parsedEvents, resolvedEvents)) {
        setParsedEvents(resolvedEvents);
      }

      if (indexing) dispatch(cleanTransactions({ indexing }));
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
    nonIndexedTransactions,
    storedWallets,
    nativePrices,
  ]);

  const fetchMore = React.useCallback(async () => {
    if (!isLoading && hasMoreEvents) {
      try {
        setIsHookLoading(true);
        await transactionService.fetchTransactionsHistory(lastEventTimestamp || Date.now());
      } catch (e) {
        console.error('Error while fetching transactions', e);
      }
      setIsHookLoading(false);
    }
  }, [isLoading, hasMoreEvents, transactionService, lastEventTimestamp]);

  return { events: parsedEvents, fetchMore, isLoading: isLoading };
}

export default useTransactionsHistory;
