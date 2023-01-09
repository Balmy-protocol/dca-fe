import useWeb3Service from './useWeb3Service';

function useErrorService() {
  const web3Service = useWeb3Service();

  return web3Service.getErrorService();
}

export default useErrorService;
