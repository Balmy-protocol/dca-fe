import React from 'react';
import { Token } from 'types';
import { useAllTransactions } from 'state/transactions/hooks';
import { BigNumber } from 'ethers';
import useWalletService from './useWalletService';

function useTokenBalance(token: Token) {
  const walletService = useWalletService();
  const transactions = useAllTransactions();
  const [tokenBalance, setTokenBalance] = React.useState<BigNumber | null>(null);

  React.useEffect(() => {
    const getTokenBalance = async () => {
      try {
        const balance = await walletService.getBalance(token.address);
        setTokenBalance(balance);
      } catch (e) {
        console.error('Error getting token balance', token, e);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getTokenBalance();
  }, [JSON.stringify(transactions), walletService.getAccount(), token]);

  return tokenBalance;
}

export default useTokenBalance;
