import { User } from '@types';
import useAccountService from './useAccountService';
import useStoredLabels from './useStoredLabels';

function useUser(): User | undefined {
  const accountService = useAccountService();
  const labels = useStoredLabels();

  const user = accountService.getUser();

  const userWithLabels: User | undefined = user
    ? {
        ...user,
        wallets: user?.wallets.map((wallet) => ({ ...wallet, label: labels[wallet.address]?.label })),
      }
    : undefined;

  return userWithLabels;
}

export default useUser;
