import React from 'react';
import { Wallet } from '@types';
import useAccountService from './useAccountService';

function useWallet(walletAddress: string): Wallet {
  const accountService = useAccountService();

  return React.useMemo(() => accountService.getWallet(walletAddress), [walletAddress]);
}

export default useWallet;
