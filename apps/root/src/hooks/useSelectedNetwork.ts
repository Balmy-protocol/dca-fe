import { DEFAULT_NETWORK_FOR_VERSION, LATEST_VERSION } from '@constants';
import { useAggregatorNetwork } from '@state/aggregator/hooks';
import { useDCANetwork } from '@state/create-position/hooks';
import { useMainTab } from '@state/tabs/hooks';
import { useTransferNetwork } from '@state/transfer/hooks';
import { NetworkStruct } from '@types';

function useSelectedNetwork() {
  const aggregatorNetwork = useAggregatorNetwork();
  const dcaNetwork = useDCANetwork();
  const transferNetwork = useTransferNetwork();
  const mainTab = useMainTab();
  let network: NetworkStruct | undefined;

  switch (mainTab) {
    case 0:
      network = dcaNetwork;
      break;
    case 1:
    case 2:
      network = aggregatorNetwork;
      break;
    case 3:
      network = transferNetwork;
      break;
    default:
      break;
  }

  return (network && { ...network, isSet: true }) || { ...DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION], isSet: false };
}

export default useSelectedNetwork;
