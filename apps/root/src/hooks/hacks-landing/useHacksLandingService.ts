import useWeb3Service from '../useWeb3Service';

function useHacksLandingService() {
  const web3Service = useWeb3Service();

  return web3Service.getHacksLandingService();
}

export default useHacksLandingService;
