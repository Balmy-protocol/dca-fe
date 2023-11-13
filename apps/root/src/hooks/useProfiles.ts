import { Account } from '@types';
import useAccountService from './useAccountService';

function useProfiles(): Account[] {
  const accountService = useAccountService();

  const accounts = accountService.getAccounts();
  return accounts;
}

export default useProfiles;
