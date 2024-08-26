import useWeb3Service from './useWeb3Service';

function useEnsService() {
  const web3Service = useWeb3Service();

  return web3Service.getEnsService();
}

export default useEnsService;
