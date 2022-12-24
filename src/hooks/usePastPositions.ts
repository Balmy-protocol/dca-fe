import React from 'react';
import { Positions } from 'types';
import { useAllTransactions } from 'state/transactions/hooks';
import usePositionService from './usePositionService';
import useAccount from './useAccount';

function usePastPositions() {
  const positionService = usePositionService();
  const account = useAccount();
  const transactions = useAllTransactions();

  const pastPositions: Positions = React.useMemo(() => positionService.getPastPositions(), [transactions, account]);

  return pastPositions;
}

export default usePastPositions;
