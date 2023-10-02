import useWeb3Service from './useWeb3Service';

function useContractService() {
  const web3Service = useWeb3Service();

  return web3Service.getContractService();
}

export default useContractService;
