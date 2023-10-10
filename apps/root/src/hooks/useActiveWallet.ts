import useAccountService from './useAccountService';

function useActiveWallet() {
  const accountService = useAccountService();

  return accountService.getActiveWallet();
}

export default useActiveWallet;
