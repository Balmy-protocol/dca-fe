import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';
import { ConnectedWallet, User as PrivyUser } from '@privy-io/react-auth';
import { find } from 'lodash';

enum WalletType {
  embedded = 'embedded',
  external = 'external',
}

type Wallet = {
  type: WalletType;
  address: string;
  label: string;
  getProvider(): Promise<Provider>;
  getSigner?(): Signer;
};

type User = {
  id: string; // For privy: `privy-${id}`, for external wallets: `wallet-${address}`
  wallets: Wallet[];
};

type IAccountService = {
  user: User;
  activeWallet: Wallet;
  getUser(): User;
  setActiveWallet(wallet: string): void;
  getActiveWallet(): Wallet;
  setUser(user: PrivyUser, wallets: ConnectedWallet[]): void;
};

export default class AccountService implements IAccountService {
  user: User;

  activeWallet: Wallet;

  // constructor() {

  // };

  getUser(): User {
    return this.user;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setActiveWallet(wallet: string): void {
    this.activeWallet = find(this.user.wallets, { address: wallet })!;
    return;
  }

  getActiveWallet(): Wallet {
    return this.activeWallet;
  }

  setUser(user: PrivyUser, wallets: ConnectedWallet[]): void {
    this.user = {
      id: `privy-${user.id}`,
      wallets: wallets.map((wallet) => ({
        type: WalletType.embedded,
        address: wallet.address,
        label: wallet.address,
        getProvider: wallet.getEthersProvider,
      })),
    };

    this.setActiveWallet(wallets[0].address);
  }
}
