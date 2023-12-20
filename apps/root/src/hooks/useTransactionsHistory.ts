import React from 'react';
import useTransactionService from './useTransactionService';
import useAccountService from './useAccountService';

function useTransactionsHistory(beforeTimestamp?: number) {
  const accountService = useAccountService();
  const transactionService = useTransactionService();
  const user = accountService.getUser();
  const wallets = accountService.getWallets();
  const storedTransactionsHistory = transactionService.getStoredTransactionsHistory();
  const fetchingRef = React.useRef(false);
  React.useEffect(() => {
    const fetchHistory = async () => {
      if (fetchingRef.current) return;
      await transactionService.fetchTransactionsHistory(beforeTimestamp);
      fetchingRef.current = false;
    };

    const shouldFetchHistory =
      !storedTransactionsHistory || wallets.some(({ address }) => !storedTransactionsHistory.indexing[address]);

    if (shouldFetchHistory && user && user.id !== 'pending') {
      void fetchHistory();
    }
  }, [storedTransactionsHistory, wallets, user]);

  return storedTransactionsHistory;
}

export default useTransactionsHistory;
