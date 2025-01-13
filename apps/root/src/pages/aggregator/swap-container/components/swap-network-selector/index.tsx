import React from 'react';
import NetworkSelector from '@common/components/network-selector';
import useAnalytics from '@hooks/useAnalytics';
import { useAppDispatch } from '@hooks/state';
import { compact, find, orderBy } from 'lodash';
import useSdkChains from '@hooks/useSdkChains';
import useReplaceHistory from '@hooks/useReplaceHistory';
import { getAllChains } from '@balmy/sdk';
import { NETWORKS, sdkNetworkToNetworkStruct, AGGREGATOR_SUPPORTED_CHAINS } from '@constants';
import { setAggregatorChainId } from '@state/aggregator/actions';

const SwapNetworkSelector = () => {
  const dispatch = useAppDispatch();
  const { trackEvent } = useAnalytics();
  const supportedChains = useSdkChains();
  const replaceHistory = useReplaceHistory();

  const networkList = React.useMemo(
    () =>
      compact(
        orderBy(
          supportedChains
            .map((networkId) => {
              const foundSdkNetwork = find(
                getAllChains().filter((chain) => !chain.testnet || chain.ids.includes('base-goerli')),
                { chainId: networkId }
              );
              const foundNetwork = find(NETWORKS, { chainId: networkId });

              if (!foundSdkNetwork) {
                return null;
              }
              return {
                ...sdkNetworkToNetworkStruct(foundSdkNetwork),
                ...(foundNetwork || {}),
              };
            })
            .filter((network) => AGGREGATOR_SUPPORTED_CHAINS.includes(network?.chainId || -1)),
          ['testnet'],
          ['desc']
        )
      ),
    [supportedChains]
  );

  const handleChangeNetworkCallback = React.useCallback(
    (chainId: number) => {
      dispatch(setAggregatorChainId(chainId));
      replaceHistory(`/swap/${chainId}`);
      trackEvent('Aggregator - Change displayed network');
    },
    [dispatch, replaceHistory, trackEvent]
  );

  return <NetworkSelector networkList={networkList} handleChangeCallback={handleChangeNetworkCallback} />;
};

export default SwapNetworkSelector;
