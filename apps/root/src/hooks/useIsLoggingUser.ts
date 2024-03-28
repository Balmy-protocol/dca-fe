import AccountService, { AccountServiceData } from '@services/accountService';
import useAccountService from './useAccountService';
import useServiceEvents from './useServiceEvents';

function useIsLoggingUser() {
  const accountService = useAccountService();

  const isLoggingUser = useServiceEvents<AccountServiceData, AccountService, 'getIsLoggingUser'>(
    accountService,
    'getIsLoggingUser'
  );

  return isLoggingUser;
}

export default useIsLoggingUser;
