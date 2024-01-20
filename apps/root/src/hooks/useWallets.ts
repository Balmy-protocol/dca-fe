import { Wallet } from '@types';
import useUser from './useUser';

function useWallets(): Wallet[] {
  const user = useUser();

  return user?.wallets || [];
}

export default useWallets;
