import { DEFAULT_NETWORK_FOR_VERSION, LATEST_VERSION } from '@constants';
import { useAggregatorNetwork } from '@state/aggregator/hooks';
import { useDCANetwork } from '@state/create-position/hooks';
import { useMainTab } from '@state/tabs/hooks';
import { NetworkStruct } from '@types';

function useSelectedNetwork() {
  const aggregatorNetwork = useAggregatorNetwork();
  const dcaNetwork = useDCANetwork();
  const mainTab = useMainTab();
  let network: NetworkStruct | undefined;

  if (mainTab === 0) {
    network = dcaNetwork;
  } else {
    network = aggregatorNetwork;
  }

  return (network && { ...network, isSet: true }) || { ...DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION], isSet: false };
}

export default useSelectedNetwork;
