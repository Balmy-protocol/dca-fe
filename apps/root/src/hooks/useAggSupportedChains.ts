import React from 'react';
import find from 'lodash/find';
import compact from 'lodash/compact';
import useSdkChains from '@hooks/useSdkChains';
import { Chain, getAllChains } from '@balmy/sdk';
import { AGGREGATOR_SUPPORTED_CHAINS, NETWORKS } from '@constants';

function useAggSupportedChains() {
  const supportedChains = useSdkChains();

  return React.useMemo(
    () =>
      compact<Chain>(
        supportedChains.map((networkId) => {
          const foundSdkNetwork = find(
            getAllChains().filter((chain) => !chain.testnet || chain.ids.includes('base-goerli')),
            { chainId: networkId }
          );
          const foundNetwork = find(NETWORKS, { chainId: networkId });

          if (!foundSdkNetwork || !AGGREGATOR_SUPPORTED_CHAINS.includes(foundNetwork?.chainId || -1)) {
            return null;
          }

          return {
            ...foundSdkNetwork,
            ...((foundNetwork as unknown as Chain) || {}),
            name: foundSdkNetwork.name.toLowerCase() || foundNetwork?.name.toLowerCase() || '',
          };
        })
      ),
    [supportedChains]
  );
}

export default useAggSupportedChains;
