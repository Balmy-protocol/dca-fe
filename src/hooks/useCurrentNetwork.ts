import { NETWORKS } from 'config/constants';
import { useAppSelector } from 'state/hooks';

function useCurrentNetwork() {
  const network = useAppSelector((state) => state.config.network);
  return (network && { ...network, isSet: true }) || { ...NETWORKS.optimism, isSet: false };
}

export default useCurrentNetwork;
