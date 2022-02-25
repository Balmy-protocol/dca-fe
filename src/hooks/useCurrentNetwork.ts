import { NETWORKS } from 'config/constants';
import { useAppSelector } from 'state/hooks';

function useCurrentNetwork() {
  const network = useAppSelector(state => state.config.network);
  return network || NETWORKS.optimism;
}

export default useCurrentNetwork;
