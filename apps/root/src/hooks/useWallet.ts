import React from 'react';
import { Wallet } from '@types';
import useAccountService from './useAccountService';
import { useWallets } from '@privy-io/react-auth';

function useWallet(walletAddress: string): Wallet {
  const accountService = useAccountService();
  const wallets = useWallets();

  return React.useMemo(() => accountService.getWallet(walletAddress), [walletAddress, wallets]);
}

export default useWallet;
