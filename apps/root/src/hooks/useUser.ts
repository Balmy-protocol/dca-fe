import { User } from '@types';
import useAccountService from './useAccountService';

function useUser(): User | undefined {
  const accountService = useAccountService();

  return accountService.getUser();
}

export default useUser;
