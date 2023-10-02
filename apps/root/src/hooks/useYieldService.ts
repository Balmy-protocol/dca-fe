import useWeb3Service from './useWeb3Service';

function useYieldService() {
  const web3Service = useWeb3Service();

  return web3Service.getYieldService();
}

export default useYieldService;
