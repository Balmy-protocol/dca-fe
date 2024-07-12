import React from 'react';
import { NETWORKS } from '@constants';
import find from 'lodash/find';
import useWallets from './useWallets';

function useWalletNetwork(walletAddress: string) {
  const wallets = useWallets();

  return React.useMemo(() => {
    const foundWallet = wallets.find((wallet) => wallet.address.toLowerCase() === walletAddress.toLowerCase());
    const foundNetwork = find(NETWORKS, { chainId: foundWallet?.chainId });

    return foundNetwork;
  }, [walletAddress, wallets]);
}

export default useWalletNetwork;
