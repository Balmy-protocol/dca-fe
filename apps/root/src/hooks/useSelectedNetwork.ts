import { DEFAULT_NETWORK_FOR_VERSION, LATEST_VERSION } from '@constants';
import { DCA_CREATE_ROUTE, DCA_ROUTE, SWAP_ROUTE, TRANSFER_ROUTE } from '@constants/routes';
import { useAggregatorNetwork } from '@state/aggregator/hooks';
import { useDCANetwork } from '@state/create-position/hooks';
import { useCurrentRoute } from '@state/tabs/hooks';
import { useTransferNetwork } from '@state/transfer/hooks';
import { NetworkStruct } from '@types';

function useSelectedNetwork() {
  const aggregatorNetwork = useAggregatorNetwork();
  const dcaNetwork = useDCANetwork();
  const transferNetwork = useTransferNetwork();
  const currentRoute = useCurrentRoute();
  let network: NetworkStruct | undefined;

  switch (currentRoute) {
    case DCA_CREATE_ROUTE.key:
    case DCA_ROUTE.key:
      network = dcaNetwork;
      break;
    case SWAP_ROUTE.key:
      network = aggregatorNetwork;
      break;
    case TRANSFER_ROUTE.key:
      network = transferNetwork;
      break;
    default:
      break;
  }

  return (network && { ...network, isSet: true }) || { ...DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION], isSet: false };
}

export default useSelectedNetwork;
