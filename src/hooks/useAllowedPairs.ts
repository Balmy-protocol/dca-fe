import React from 'react';
import { AllowedPairs } from 'types';
import { useAllTransactions } from 'state/transactions/hooks';
import usePairService from './usePairService';

function useAllowedPairs() {
  const pairService = usePairService();
  const transactions = useAllTransactions();
  const hasFetchedPairs = pairService.getHasFetchedAvailablePairs();

  const allowedPairs: AllowedPairs = React.useMemo(
    () => pairService.getAllowedPairs(),
    [transactions, hasFetchedPairs]
  );

  return allowedPairs;
}

export default useAllowedPairs;
