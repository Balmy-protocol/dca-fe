import { useAppDispatch } from '@hooks/state';
import { setNetwork } from './actions';
import React from 'react';
import useProviderService from '@hooks/useProviderService';
import useAccountService from '@hooks/useAccountService';
import find from 'lodash/find';
import { NETWORKS, SUPPORTED_NETWORKS } from '@constants';
import { NetworkStruct } from 'common-types';
import useActiveWallet from '@hooks/useActiveWallet';
import useSdkChains from '@hooks/useSdkChains';

const NetworkUpdater = () => {
  const dispatch = useAppDispatch();
  const providerService = useProviderService();
  const accountService = useAccountService();
  const activeWallet = useActiveWallet();
  const aggSupportedNetworks = useSdkChains();

  React.useEffect(() => {
    async function getNetwork() {
      try {
        const isConnected = !!accountService.getUser();
        if (isConnected && activeWallet?.address) {
          const web3Network = await providerService.getNetwork(activeWallet.address);
          if (!web3Network) throw new Error('No network found');

          const networkToSet = find(NETWORKS, { chainId: web3Network.chainId });
          if (SUPPORTED_NETWORKS.includes(web3Network.chainId) || aggSupportedNetworks.includes(web3Network.chainId)) {
            dispatch(setNetwork(networkToSet as NetworkStruct));
          }
        }
      } catch (e) {
        console.error('Found error while trying to set up network', e);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getNetwork();
  }, [activeWallet?.address, activeWallet?.status]);

  return null;
};

export default NetworkUpdater;
