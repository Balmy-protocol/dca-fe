import { LATEST_VERSION } from '@constants';
import { PositionVersions } from '@types';
import useSelectedNetwork from './useSelectedNetwork';
import useWeb3Service from './useWeb3Service';

function useUNIGraphql(chainId?: number, version: PositionVersions = LATEST_VERSION) {
  const web3Service = useWeb3Service();
  const currentNetwork = useSelectedNetwork();
  const chainIdTouse = chainId || currentNetwork.chainId;

  return web3Service.getUNIGraphqlClient()[version][chainIdTouse].getClient();
}

export default useUNIGraphql;
