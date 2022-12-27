import useWeb3Service from './useWeb3Service';

function useProviderService() {
  const web3Service = useWeb3Service();

  return web3Service.getProviderService();
}

export default useProviderService;
