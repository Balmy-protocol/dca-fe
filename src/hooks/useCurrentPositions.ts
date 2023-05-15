import React from 'react';
import { Positions } from '@types';
import { useAllTransactions } from '@state/transactions/hooks';
import { useHasInitialized } from '@state/initializer/hooks';
import usePositionService from './usePositionService';
import useAccount from './useAccount';

function useCurrentPositions(returnPermissioned?: boolean) {
  const positionService = usePositionService();
  const account = useAccount();
  const transactions = useAllTransactions();
  const hasFetchedCurrentPositions = positionService.getHasFetchedCurrentPositions();
  const hasInitialized = useHasInitialized();

  const currentPositions: Positions = React.useMemo(() => {
    let positions = account ? positionService.getCurrentPositions() : [];
    if (!returnPermissioned) {
      positions = positions.filter(({ user }) => user.toLowerCase() === account.toLowerCase());
    }
    return positions;
  }, [transactions, account, hasInitialized, hasFetchedCurrentPositions]);

  return currentPositions;
}

export default useCurrentPositions;
