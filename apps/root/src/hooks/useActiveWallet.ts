import React from 'react';
import useAccountService from './useAccountService';
import useServiceEvents from './useServiceEvents';
import AccountService, { AccountServiceData } from '@services/accountService';
import useWallets from './useWallets';

function useActiveWallet() {
  const accountService = useAccountService();

  const activeWallet = useServiceEvents<AccountServiceData, AccountService, 'getActiveWallet'>(
    accountService,
    'getActiveWallet'
  );

  const wallets = useWallets();

  return React.useMemo(() => wallets.find((w) => w.address === activeWallet?.address), [activeWallet, wallets]);
}

export default useActiveWallet;
