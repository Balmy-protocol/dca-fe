import useWeb3Service from './useWeb3Service';

function usePositionService() {
  const web3Service = useWeb3Service();

  return web3Service.getPositionService();
}

export default usePositionService;
