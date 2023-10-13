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

    const provider = await this.activeWallet.getProvider();

    await provider.getNetwork();
    // const web3provider = new ethers.providers.Web3Provider(provider, 'any');
    return provider;
  }

  async getActiveWalletSigner() {
    const provider = await this.getActiveWalletProvider();

    if (!provider) {
      return undefined;
    }

    return provider.getSigner();
  }

  async getWalletProvider(wallet: string) {
    const foundWallet = find(this.user?.wallets || [], { address: wallet.toLowerCase() });

    if (!foundWallet) {
      throw new Error('Cannot find wallet');
    }

    const provider = await foundWallet.getProvider();

    return provider;
  }

  async getWalletSigner(wallet: string) {
    const provider = await this.getWalletProvider(wallet);

    return provider.getSigner();
  }

  getActiveWallet(): Wallet | undefined {
    return this.activeWallet;
  }

  setUser(user: BasePrivyUser, wallets: ConnectedWallet[]): void {
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
