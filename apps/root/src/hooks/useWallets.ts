import { Wallet } from '@types';
import useStoredLabels from './useStoredLabels';
import useUser from './useUser';

function useWallets(): Wallet[] {
  const labels = useStoredLabels();
  const user = useUser();

  const labeledWallets = user?.wallets.map((wallet) => ({ ...wallet, label: labels[wallet.address]?.label }));

  return labeledWallets || [];
}

export default useWallets;
