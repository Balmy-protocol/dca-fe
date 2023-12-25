import React from 'react';
import useTransactionService from './useTransactionService';
import { isUndefined, last } from 'lodash';

function useTransactionsHistory(beforeTimestamp?: number) {
  const transactionService = useTransactionService();
  const storedTransactionsHistory = transactionService.getStoredTransactionsHistory();

  React.useEffect(() => {
    const lastEventTimestamp = last(storedTransactionsHistory?.events)?.timestamp;

    if (isUndefined(lastEventTimestamp) || isUndefined(beforeTimestamp)) {
      return;
    }

    const fetchMore = async () => {
      await transactionService.fetchTransactionsHistory(beforeTimestamp);
    };

    const shouldFetchMoreHistory =
      beforeTimestamp < lastEventTimestamp && storedTransactionsHistory?.pagination.moreEvents;

    if (shouldFetchMoreHistory) {
      void fetchMore();
    }
  }, [beforeTimestamp]);

  return storedTransactionsHistory;
}

export default useTransactionsHistory;
