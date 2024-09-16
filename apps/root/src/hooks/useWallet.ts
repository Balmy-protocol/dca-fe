import React from 'react';
import useWallets from './useWallets';

function useWallet(walletAddress: string) {
  const wallets = useWallets();

  return React.useMemo(() => wallets.find(({ address }) => address === walletAddress), [wallets, walletAddress]);
}

export default useWallet;
