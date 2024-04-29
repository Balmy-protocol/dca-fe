import useServiceEvents from './useServiceEvents';
import useTransactionService from './useTransactionService';
import TransactionService, { TransactionServiceData } from '@services/transactionService';

function useDcaIndexingBlocks() {
  const transactionService = useTransactionService();

  const dcaIndexingBlocks = useServiceEvents<TransactionServiceData, TransactionService, 'getDcaIndexingBlocks'>(
    transactionService,
    'getDcaIndexingBlocks'
  );

  return dcaIndexingBlocks;
}

export default useDcaIndexingBlocks;
