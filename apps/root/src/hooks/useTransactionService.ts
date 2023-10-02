import useWeb3Service from './useWeb3Service';

function useTransactionService() {
  const web3Service = useWeb3Service();

  return web3Service.getTransactionService();
}

export default useTransactionService;
