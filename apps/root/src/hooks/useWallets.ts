import { Wallet } from '@types';
import useAccountService from './useAccountService';
import useStoredLabels from './useStoredLabels';

function useWallets(): Wallet[] {
  const accountService = useAccountService();
  const labels = useStoredLabels();

  const labeledWallets = accountService
    .getWallets()
    .map((wallet) => ({ ...wallet, label: labels[wallet.address]?.label }));

  return labeledWallets;
}

export default useWallets;
