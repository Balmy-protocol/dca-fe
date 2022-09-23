import useWeb3Service from './useWeb3Service';

function useMeanApiService() {
  const web3Service = useWeb3Service();

  return web3Service.getMeanApiService();
}

export default useMeanApiService;
