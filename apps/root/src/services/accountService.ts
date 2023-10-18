import { ConnectedWallet, User as BasePrivyUser } from '@privy-io/react-auth';
import { IAccountService, UserType, WalletType, User, Wallet } from '@types';
import { find } from 'lodash';
import Web3Service from './web3Service';

export default class AccountService implements IAccountService {
  user?: User;

  activeWallet?: Wallet;

  web3Service: Web3Service;

  constructor(web3Service: Web3Service) {
    this.web3Service = web3Service;
  }

  getUser(): User | undefined {
    return this.user;
  }

  getWallets(): Wallet[] {
    return this.user?.wallets || [];
  }

  async setActiveWallet(wallet: string): Promise<void> {
    this.activeWallet = find(this.user?.wallets || [], { address: wallet.toLowerCase() })!;
    const provider = await this.activeWallet.getProvider();

    await this.web3Service.connect(provider, undefined, undefined, this.activeWallet.type === WalletType.embedded);
    return;
  }

  async getActiveWalletProvider() {
    if (!this.activeWallet) {
      return undefined;
    }

    return this.getWalletProvider(this.activeWallet.address);
  }

  async getActiveWalletSigner() {
    if (!this.activeWallet) {
      return undefined;
    }

    return this.getWalletSigner(this.activeWallet.address);
  }

  async getWalletProvider(wallet: string) {
    const foundWallet = find(this.user?.wallets || [], { address: wallet.toLowerCase() });

    if (!foundWallet) {
      throw new Error('Cannot find wallet');
    }

    const provider = await foundWallet.getProvider();

    await provider.getNetwork();

    return provider;
  }

  async getWalletSigner(wallet: string) {
    const provider = await this.getWalletProvider(wallet);

    return provider.getSigner();
  }

  getActiveWallet(): Wallet | undefined {
    return this.activeWallet;
  }

  setUser(user?: BasePrivyUser, wallets?: ConnectedWallet[]): void {
    if (!user || !wallets) {
      this.user = undefined;
      this.activeWallet = undefined;
      return;
    }

    this.user = {
      id: `privy-${user.id}`,
      type: UserType.privy,
      privyUser: user,
      wallets: wallets.map((wallet) => ({
        type: WalletType.embedded,
        address: wallet.address.toLowerCase(),
        label: wallet.address,
        getProvider: wallet.getEthersProvider,
      })),
    };

    const embeddedWallet = find(this.user.wallets, { type: WalletType.embedded });

    if (!this.activeWallet) {
      void this.setActiveWallet(embeddedWallet?.address || wallets[0].address);
    }
  }
}
