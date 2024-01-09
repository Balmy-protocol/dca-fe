import useAccountService from './useAccountService';

function useWalletsAddresses(): string[] {
  const accountService = useAccountService();

  return accountService.getWallets().map(({ address }) => address);
}

export default useWalletsAddresses;
