import useWeb3Service from './useWeb3Service';

function useLabelService() {
  const web3Service = useWeb3Service();

  return web3Service.getLabelService();
}

export default useLabelService;
