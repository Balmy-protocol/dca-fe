import React from 'react';
import useTransactionService from './useTransactionService';

function useTransactionsHistory() {
  const transactionService = useTransactionService();
  const { isLoading, history } = transactionService.getStoredTransactionsHistory();

  const lastEventTimestamp = React.useMemo(() => history?.events[history?.events.length - 1].timestamp, [history]);
  const hasMoreEvents = React.useMemo(() => history?.pagination.moreEvents, [history]);

  const fetchMore = React.useCallback(async () => {
    if (!isLoading && hasMoreEvents) {
      try {
        await transactionService.fetchTransactionsHistory(lastEventTimestamp || Date.now());
      } catch (e) {
        console.error('Error while fetching transactions', e);
      }
    }
  }, [lastEventTimestamp, hasMoreEvents]);

  return { history, fetchMore, isLoading };
}

export default useTransactionsHistory;
