import React from 'react';
import { Wallet } from '@types';
import useStoredLabels from './useStoredLabels';
import useUser from './useUser';
import useStoredEnsNames from './useStoredEnsNames';
import { Address } from 'viem';
import { AvailableProvider } from '@services/walletClientsService';
import useAvailableProviders from './useAvailableProviders';

export interface DisplayWallet extends Wallet, AvailableProvider {
  status: Wallet['status'];
  providerStatus: AvailableProvider['status'];
}

function useWallets(): DisplayWallet[] {
  const labels = useStoredLabels();
  const ensNames = useStoredEnsNames();
  const user = useUser();
  const availableProviders = useAvailableProviders();

  return React.useMemo(() => {
    return (
      user?.wallets.map((wallet) => ({
        ...wallet,
        label: labels[wallet.address]?.label,
        ens: ensNames[wallet.address.toLowerCase() as Address],
        ...(availableProviders[wallet.address] || {}),
        status: wallet.status,
        providerStatus: (availableProviders[wallet.address] || {}).status,
      })) || []
    );
  }, [availableProviders, labels, user]);
}

export default useWallets;
