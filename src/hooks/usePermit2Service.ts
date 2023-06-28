import useWeb3Service from './useWeb3Service';

function usePermit2Service() {
  const web3Service = useWeb3Service();

  return web3Service.getPermit2Service();
}

export default usePermit2Service;
