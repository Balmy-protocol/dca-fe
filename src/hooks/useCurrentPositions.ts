import React from 'react';
import { Positions } from 'types';
import { useAllTransactions } from 'state/transactions/hooks';
import { useHasInitialized } from 'state/initializer/hooks';
import usePositionService from './usePositionService';
import useWalletService from './useWalletService';

function useCurrentPositions() {
  const positionService = usePositionService();
  const walletService = useWalletService();
  const transactions = useAllTransactions();
  const hasInitialized = useHasInitialized();

  const currentPositions: Positions = React.useMemo(
    () => positionService.getCurrentPositions(),
    [transactions, walletService.getAccount(), hasInitialized]
  );

  return currentPositions;
}

export default useCurrentPositions;
