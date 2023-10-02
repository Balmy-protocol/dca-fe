import React from 'react';
import { AvailablePairs } from '@types';
import { useAllTransactions } from '@state/transactions/hooks';
import usePairService from './usePairService';

function useAvailablePairs() {
  const pairService = usePairService();
  const transactions = useAllTransactions();

  const availablePairs: AvailablePairs = React.useMemo(() => pairService.getAvailablePairs(), [transactions]);

  return availablePairs;
}

export default useAvailablePairs;
