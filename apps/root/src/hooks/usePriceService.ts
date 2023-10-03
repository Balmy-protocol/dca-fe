import useWeb3Service from './useWeb3Service';

function usePriceService() {
  const web3Service = useWeb3Service();

  return web3Service.getPriceService();
}

export default usePriceService;
