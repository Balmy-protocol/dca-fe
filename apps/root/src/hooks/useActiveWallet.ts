import useAccountService from './useAccountService';
import useServiceEvents from './useServiceEvents';
import AccountService, { AccountServiceData } from '@services/accountService';

function useActiveWallet() {
  const accountService = useAccountService();

  const activeWallet = useServiceEvents<AccountServiceData, AccountService, 'getActiveWallet'>(
    accountService,
    'getActiveWallet'
  );

  return activeWallet;
}

export default useActiveWallet;
