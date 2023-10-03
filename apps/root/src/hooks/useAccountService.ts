import useWeb3Service from './useWeb3Service';

function useAccountService() {
  const web3Service = useWeb3Service();

  return web3Service.getAccountService();
}

export default useAccountService;
