import { Wallet } from '@types';
import useAccountService from './useAccountService';

function useWallets(): Wallet[] {
  const accountService = useAccountService();

  return accountService.getWallets();
}

export default useWallets;
