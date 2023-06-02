import useWeb3Service from './useWeb3Service';

function useConnextService() {
  const web3Service = useWeb3Service();

  return web3Service.getConnextService();
}

export default useConnextService;
