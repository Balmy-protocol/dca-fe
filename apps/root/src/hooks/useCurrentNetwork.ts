import { DEFAULT_NETWORK_FOR_VERSION, LATEST_VERSION, NETWORKS } from '@constants';
import { useAppSelector } from '@state/hooks';
import useActiveWallet from './useActiveWallet';
import find from 'lodash/find';
import React from 'react';

function useCurrentNetwork() {
  const activeWallet = useActiveWallet();
  const network = useAppSelector((state) => state.config.network);

  const foundNetwork = React.useMemo(() => find(NETWORKS, { chainId: activeWallet?.chainId }), [activeWallet?.chainId]);

  return React.useMemo(
    () =>
      foundNetwork ||
      (network && { ...network, isSet: true }) || { ...DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION], isSet: false },
    [foundNetwork, network]
  );
}

export default useCurrentNetwork;
