import useAccountService from './useAccountService';

function useSignInWallet() {
  const accountService = useAccountService();

  return accountService.getSignInWallet();
}

export default useSignInWallet;
