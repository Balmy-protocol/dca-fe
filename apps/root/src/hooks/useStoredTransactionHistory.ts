import TransactionService, { TransactionServiceData } from '@services/transactionService';
import useServiceEvents from './useServiceEvents';
import useTransactionService from './useTransactionService';

export default function useStoredTransactionHistory() {
  const transactionService = useTransactionService();

  const { isLoading, history } = useServiceEvents<
    TransactionServiceData,
    TransactionService,
    'getStoredTransactionsHistory'
  >(transactionService, 'getStoredTransactionsHistory');

  return { isLoading, history };
}
