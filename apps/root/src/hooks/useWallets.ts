import { Wallet } from '@types';
import useStoredLabels from './useStoredLabels';
import useUser from './useUser';
import useStoredEnsNames from './useStoredEnsNames';
import { Address } from 'viem';

function useWallets(): Wallet[] {
  const labels = useStoredLabels();
  const ensNames = useStoredEnsNames();
  const user = useUser();

  const labeledWallets = user?.wallets.map((wallet) => ({
    ...wallet,
    label: labels[wallet.address]?.label,
    ens: ensNames[wallet.address.toLowerCase() as Address],
  }));

  return labeledWallets || [];
}

export default useWallets;
