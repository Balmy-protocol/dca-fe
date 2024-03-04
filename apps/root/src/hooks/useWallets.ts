import { Wallet } from '@types';
import useAccountService from './useAccountService';
import useStoredLabels from './useStoredLabels';
import useServiceEvents from './useServiceEvents';
import AccountService, { AccountServiceData } from '@services/accountService';

function useWallets(): Wallet[] {
  const accountService = useAccountService();
  const labels = useStoredLabels();

  const wallets = useServiceEvents<AccountServiceData, AccountService, 'getWallets'>(accountService, 'getWallets');

  const labeledWallets = wallets.map((wallet) => ({ ...wallet, label: labels[wallet.address]?.label }));

  return labeledWallets;
}

export default useWallets;
