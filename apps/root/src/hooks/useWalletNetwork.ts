import React from 'react';
import { useWallets } from '@privy-io/react-auth';
import useAccountService from './useAccountService';
import { NetworkStruct, WalletStatus } from '@types';
import { NETWORKS } from '@constants';
import find from 'lodash/find';

function useWalletNetwork(walletAddress: string): [Nullable<NetworkStruct>, boolean, string?] {
  const [{ result, isLoading, error }, setParams] = React.useState<{
    result: Nullable<NetworkStruct>;
    error: string | undefined;
    isLoading: boolean;
  }>({ result: null, error: undefined, isLoading: false });
  const wallets = useWallets();
  const accountService = useAccountService();

  React.useEffect(() => {
    async function callPromise() {
      try {
        const wallet = accountService.getWallet(walletAddress);

        if (wallet.status === WalletStatus.disconnected) {
          throw new Error('Wallet is not connected');
        }
        const provider = await wallet.getProvider();

        let network;

        if (provider.chain?.id) {
          const foundNetwork = find(NETWORKS, { chainId: provider.chain.id });

          network = foundNetwork;
        }

        setParams({ isLoading: false, result: network || null, error: undefined });
      } catch (e) {
        setParams({ isLoading: false, result: null, error: e as string });
      }
    }

    if (!isLoading && !result && !error) {
      setParams({ isLoading: true, result: null, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [isLoading, result, error, wallets, walletAddress]);

  return [result, isLoading, error];
}

export default useWalletNetwork;
