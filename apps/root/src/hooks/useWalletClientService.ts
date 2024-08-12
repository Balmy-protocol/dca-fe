import useWeb3Service from './useWeb3Service';

function useWalletClientService() {
  const web3Service = useWeb3Service();

  return web3Service.getWalletsClientService();
}

export default useWalletClientService;
