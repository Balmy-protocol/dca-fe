import { TRANSACTION_TYPES } from 'config';
import { useMemo } from 'react';
import { useAllNotClearedTransactions } from 'state/transactions/hooks';

const useHasPendingTransactions = () => {
  const transactions = useAllNotClearedTransactions();

  return useMemo(
    () =>
      Object.keys(transactions).some(
        (hash) => transactions[hash].type === TRANSACTION_TYPES.EULER_CLAIM_PERMIT_MANY && !transactions[hash].receipt
      ),
    [transactions]
  );
};

export default useHasPendingTransactions;
