import { POSITION_VERSION_3, VERSIONS } from 'config';
import useCurrentNetwork from './useCurrentNetwork';
import useWeb3Service from './useWeb3Service';

function useUNIGraphql(chainId?: number, version: VERSIONS = POSITION_VERSION_3) {
  const web3Service = useWeb3Service();
  const currentNetwork = useCurrentNetwork();
  const chainIdTouse = chainId || currentNetwork.chainId;

  return web3Service.getUNIGraphqlClient()[version][chainIdTouse].getClient();
}

export default useUNIGraphql;
