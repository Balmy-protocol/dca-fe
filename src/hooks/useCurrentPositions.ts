import React from 'react';
import WalletContext from 'common/wallet-context';
import { PositionsRaw } from 'types';
import { useAllTransactions } from 'state/transactions/hooks';

function useCurrentPositions() {
  const { web3Service } = React.useContext(WalletContext);
  const transactions = useAllTransactions();

  const currentPositions: PositionsRaw = React.useMemo(
    () => web3Service.getCurrentPositions(),
    [transactions, web3Service.getAccount()]
  );

  return currentPositions;
}

export default useCurrentPositions;
