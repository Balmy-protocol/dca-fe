import useWeb3Service from './useWeb3Service';

function useAggregatorService() {
  const web3Service = useWeb3Service();

  return web3Service.getAggregatorService();
}

export default useAggregatorService;
