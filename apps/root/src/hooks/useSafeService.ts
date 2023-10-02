import useWeb3Service from './useWeb3Service';

function useSafeService() {
  const web3Service = useWeb3Service();

  return web3Service.getSafeService();
}

export default useSafeService;
