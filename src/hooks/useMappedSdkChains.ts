import React from 'react';
import find from 'lodash/find';
import compact from 'lodash/compact';
import useSdkChains from 'hooks/useSdkChains';
import { getAllChains } from '@mean-finance/sdk';
import { NETWORKS } from 'config';

function useSdkMappedChains() {
  const supportedChains = useSdkChains();

  return React.useMemo(
    () =>
      compact(
        supportedChains.map((networkId) => {
          const foundSdkNetwork = find(
            getAllChains().filter((chain) => !chain.testnet),
            { chainId: networkId }
          );
          const foundNetwork = find(NETWORKS, { chainId: networkId });

          if (!foundSdkNetwork) {
            return null;
          }

          return {
            ...foundSdkNetwork,
            ...(foundNetwork || {}),
            name: foundSdkNetwork.name.toLowerCase() || foundNetwork?.name.toLowerCase(),
          };
        })
      ),
    [supportedChains]
  );
}

export default useSdkMappedChains;
