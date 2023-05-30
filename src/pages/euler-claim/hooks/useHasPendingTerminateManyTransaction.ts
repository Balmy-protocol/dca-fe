import { TransactionTypes } from '@types';
import { useMemo } from 'react';
import { useAllNotClearedTransactions } from '@state/transactions/hooks';

const useHasPendingTransactions = () => {
  const transactions = useAllNotClearedTransactions();

  return useMemo(
    () =>
      Object.keys(transactions).some(
        (hash) => transactions[hash].type === TransactionTypes.eulerClaimTerminateMany && !transactions[hash].receipt
      ),
    [transactions]
  );
};

export default useHasPendingTransactions;
