import useWeb3Service from './useWeb3Service';

function useContactListService() {
  const web3Service = useWeb3Service();

  return web3Service.getContactListService();
}

export default useContactListService;
