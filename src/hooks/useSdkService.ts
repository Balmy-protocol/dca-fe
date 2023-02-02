import useWeb3Service from './useWeb3Service';

function useSdkService() {
  const web3Service = useWeb3Service();

  return web3Service.getSdkService();
}

export default useSdkService;
