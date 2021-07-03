import React from 'react';
import WalletContext from 'common/wallet-context';
import { AvailablePairs } from 'types';
import { useAllTransactions } from 'state/transactions/hooks';

function useAvailablePairs() {
  const { web3Service } = React.useContext(WalletContext);
  const transactions = useAllTransactions();

  const availablePairs: AvailablePairs = React.useMemo(() => web3Service.getAvailablePairs(), [transactions]);

  return availablePairs;
}

export default useAvailablePairs;
