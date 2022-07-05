import useWeb3Service from './useWeb3Service';

function usePairService() {
  const web3Service = useWeb3Service();

  return web3Service.getPairService();
}

export default usePairService;
