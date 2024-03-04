import { User } from '@types';
import useAccountService from './useAccountService';
import useServiceEvents from './useServiceEvents';
import AccountService, { AccountServiceData } from '@services/accountService';

function useUser(): User | undefined {
  const accountService = useAccountService();

  const user = useServiceEvents<AccountServiceData, AccountService, 'getUser'>(accountService, 'getUser');

  return user;
}

export default useUser;
