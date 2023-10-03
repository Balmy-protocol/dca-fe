import { LATEST_VERSION, DEFAULT_NETWORK_FOR_VERSION } from '@constants';
import { PositionVersions } from '@types';
import useCurrentNetwork from './useCurrentNetwork';
import useWeb3Service from './useWeb3Service';

function useDCAGraphql(chainId?: number, version: PositionVersions = LATEST_VERSION) {
  const web3Service = useWeb3Service();
  const currentNetwork = useCurrentNetwork();
  const chainIdTouse = chainId || currentNetwork.chainId;
  const clients = web3Service.getDCAGraphqlClient();

  return (clients[version][chainIdTouse] || clients[version][DEFAULT_NETWORK_FOR_VERSION[version].chainId]).getClient();
}

export default useDCAGraphql;
