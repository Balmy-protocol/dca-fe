import useServiceEvents from './useServiceEvents';
import useTransactionService from './useTransactionService';
import TransactionService, { TransactionServiceData } from '@services/transactionService';

function useEarnIndexingBlocks() {
  const transactionService = useTransactionService();

  const earnIndexingBlocks = useServiceEvents<TransactionServiceData, TransactionService, 'getEarnIndexingBlocks'>(
    transactionService,
    'getEarnIndexingBlocks'
  );

  return earnIndexingBlocks;
}

export default useEarnIndexingBlocks;
