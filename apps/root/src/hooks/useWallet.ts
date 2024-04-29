import React from 'react';
import { Wallet } from '@types';
import useWallets from './useWallets';

function useWallet(walletAddress: string): Wallet | undefined {
  const wallets = useWallets();

  return React.useMemo(() => wallets.find(({ address }) => address === walletAddress), [wallets, walletAddress]);
}

export default useWallet;
