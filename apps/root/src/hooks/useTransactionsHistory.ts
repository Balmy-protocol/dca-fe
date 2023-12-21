import useTransactionService from './useTransactionService';

function useTransactionsHistory() {
  const transactionService = useTransactionService();
  const storedTransactionsHistory = transactionService.getStoredTransactionsHistory();
  return storedTransactionsHistory;
}

export default useTransactionsHistory;
