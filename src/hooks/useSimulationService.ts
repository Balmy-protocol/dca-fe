import useWeb3Service from './useWeb3Service';

function useSimulationService() {
  const web3Service = useWeb3Service();

  return web3Service.getSimulationService();
}

export default useSimulationService;
