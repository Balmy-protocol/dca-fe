import React from 'react';
import WalletContext from 'common/wallet-context';
import { PositionsRaw } from 'types';
import { useAllTransactions } from 'state/transactions/hooks';

function usePastPositions() {
  const { web3Service } = React.useContext(WalletContext);
  const transactions = useAllTransactions();

  const pastPositions: PositionsRaw = React.useMemo(() => web3Service.getPastPositions(), [transactions]);

  return pastPositions;
}

export default usePastPositions;
