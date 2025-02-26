import React from 'react';
import { Wallet } from '@types';
import useStoredLabels from './useStoredLabels';
import useUser from './useUser';
import useStoredEnsNames from './useStoredEnsNames';
import { Address } from 'viem';
import { AvailableProvider } from '@services/walletClientsService';
import useAvailableProviders from './useAvailableProviders';
import useWalletClientService from './useWalletClientService';
import { NON_AUTOMATIC_CHAIN_CHANGING_WALLETS } from '@constants';

export interface DisplayWallet extends Wallet, AvailableProvider {
  status: Wallet['status'];
  providerStatus: AvailableProvider['status'];
  canAutomaticallyChangeNetwork: boolean;
}

function useWallets(): DisplayWallet[] {
  const labels = useStoredLabels();
  const ensNames = useStoredEnsNames();
  const user = useUser();
  const availableProviders = useAvailableProviders();
  const walletClientService = useWalletClientService();
  return React.useMemo(() => {
    return (
      user?.wallets.map((wallet) => {
        const providerInfo = walletClientService.getProviderInfo(wallet.address);
        return {
          ...wallet,
          label: labels[wallet.address]?.label,
          ens: ensNames[wallet.address.toLowerCase() as Address],
          ...(availableProviders[wallet.address] || {}),
          status: wallet.status,
          providerStatus: (availableProviders[wallet.address] || {}).status,
          canAutomaticallyChangeNetwork:
            (providerInfo && !NON_AUTOMATIC_CHAIN_CHANGING_WALLETS.includes(providerInfo.name)) ?? false,
        };
      }) || []
    ).sort((a, b) => {
      // Compare aliases (label || ENS)
      const aAlias = a.label || a.ens || '';
      const bAlias = b.label || b.ens || '';

      if (aAlias && bAlias) {
        return aAlias.localeCompare(bAlias);
      }

      // If only one wallet has an alias or ENS, prioritize it
      if (aAlias) return -1;
      if (bAlias) return 1;

      // If neither has an alias or ENS, sort by address
      return a.address.localeCompare(b.address);
    });
  }, [availableProviders, labels, user, ensNames]);
}

export default useWallets;
