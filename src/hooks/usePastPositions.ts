import React from 'react';
import { Positions } from 'types';
import { useAllTransactions } from 'state/transactions/hooks';
import usePositionService from './usePositionService';
import useWalletService from './useWalletService';

function usePastPositions() {
  const positionService = usePositionService();
  const walletService = useWalletService();
  const transactions = useAllTransactions();

  const pastPositions: Positions = React.useMemo(
    () => positionService.getPastPositions(),
    [transactions, walletService.getAccount()]
  );

  return pastPositions;
}

export default usePastPositions;
