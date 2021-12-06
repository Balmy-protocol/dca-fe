import React from 'react';
import WalletContext from 'common/wallet-context';
import { Token } from 'types';
import { useAllTransactions } from 'state/transactions/hooks';
import { BigNumber } from 'ethers';

function useTokenBalance(token: Token) {
  const { web3Service } = React.useContext(WalletContext);
  const transactions = useAllTransactions();
  const [tokenBalance, setTokenBalance] = React.useState<BigNumber | null>(null);

  React.useEffect(() => {
    const getTokenBalance = async () => {
      try {
        const balance = await web3Service.getBalance(token.address);
        setTokenBalance(balance);
      } catch (e) {
        console.error('Error getting token balance', token, e);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getTokenBalance();
  }, [transactions, web3Service.getAccount(), token]);

  return tokenBalance;
}

export default useTokenBalance;
