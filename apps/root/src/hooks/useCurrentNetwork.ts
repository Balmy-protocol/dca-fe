import { DEFAULT_NETWORK_FOR_VERSION, LATEST_VERSION } from '@constants';
import { useAppSelector } from '@state/hooks';

function useCurrentNetwork() {
  const network = useAppSelector((state) => state.config.network);
  return (network && { ...network, isSet: true }) || { ...DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION], isSet: false };
}

export default useCurrentNetwork;
