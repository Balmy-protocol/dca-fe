import React from 'react';
import { Positions } from 'types';
import { useAllTransactions } from 'state/transactions/hooks';
import { useHasInitialized } from 'state/initializer/hooks';
import usePositionService from './usePositionService';
import useWalletService from './useWalletService';

function useCurrentPositions() {
  const positionService = usePositionService();
  const walletService = useWalletService();
  const account = walletService.getAccount();
  const transactions = useAllTransactions();
  const hasFetchedCurrentPositions = positionService.getHasFetchedCurrentPositions();
  const hasInitialized = useHasInitialized();

  const currentPositions: Positions = React.useMemo(
    () => (account ? positionService.getCurrentPositions() : []),
    [transactions, account, hasInitialized, hasFetchedCurrentPositions]
  );

  return currentPositions;
}

export default useCurrentPositions;
