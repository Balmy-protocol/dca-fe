import React from 'react';
import WalletContext from 'common/wallet-context';
import { Positions } from 'types';
import { useAllTransactions } from 'state/transactions/hooks';

function usePastPositions() {
  const { web3Service } = React.useContext(WalletContext);
  const transactions = useAllTransactions();

  const pastPositions: Positions = React.useMemo(
    () => web3Service.getPastPositions(),
    [transactions, web3Service.getAccount()]
  );

  return pastPositions;
}

export default usePastPositions;
