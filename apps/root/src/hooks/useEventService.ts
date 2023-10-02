import useWeb3Service from './useWeb3Service';

function useEventService() {
  const web3Service = useWeb3Service();

  return web3Service.getEventService();
}

export default useEventService;
