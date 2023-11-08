import React from 'react';
import { useWallets } from '@privy-io/react-auth';
import useAccountService from './useAccountService';
import { Network } from '@ethersproject/providers';

function useWalletNetwork(walletAddress: string): [Nullable<Network>, boolean, string?] {
  const [{ result, isLoading, error }, setParams] = React.useState<{
    result: Nullable<Network>;
    error: string | undefined;
    isLoading: boolean;
  }>({ result: null, error: undefined, isLoading: false });
  const wallets = useWallets();
  const accountService = useAccountService();

  React.useEffect(() => {
    async function callPromise() {
      try {
        const wallet = accountService.getWallet(walletAddress);

        const provider = await wallet.getProvider();

        let network;

        if (provider?.getNetwork) {
          network = await provider.getNetwork();
        } else if (provider?.detectNetwork) {
          network = await provider.detectNetwork();
        } else if (provider?.network) {
          network = provider.network;
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
