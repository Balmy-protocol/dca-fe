import useWeb3Service from './useWeb3Service';

function useAnalyticsService() {
  const web3Service = useWeb3Service();

  return web3Service.getAnalyticsService();
}

export default useAnalyticsService;
