import React from 'react';
import WalletContext from 'common/wallet-context';
import { TokenList } from 'types';
import { useAllTransactions } from 'state/transactions/hooks';

function useTokenList() {
  const { web3Service } = React.useContext(WalletContext);
  const transactions = useAllTransactions();

  const tokenList: TokenList = React.useMemo(() => web3Service.getTokenList(), [transactions]);

  return tokenList;
}

export default useTokenList;
