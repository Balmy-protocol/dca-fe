import { ConnectedWallet, User as BasePrivyUser } from '@privy-io/react-auth';
import { IAccountService, UserType, WalletType, User, Wallet } from '@types';
import { find } from 'lodash';
import Web3Service from './web3Service';
import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async setActiveWallet(wallet: string): Promise<void> {
    this.activeWallet = find(this.user?.wallets || [], { address: wallet })!;
    const provider = await this.activeWallet.getProvider();

    await this.web3Service.connect(
      provider as Web3Provider,
      undefined,
      undefined,
      this.activeWallet.type === WalletType.embedded
    );
    return;
  }

  async getActiveWalletProvider() {
    if (!this.activeWallet) {
      return undefined;
    }

    const provider = await this.activeWallet.getProvider();

    return new ethers.providers.Web3Provider(provider as ExternalProvider, 'any');
  }

  async getActiveWalletSigner() {
    const provider = await this.getActiveWalletProvider();

    if (!provider) {
      return undefined;
    }

    return provider.getSigner();
  }

  async getWalletProvider(wallet: string) {
    const foundWallet = find(this.user?.wallets || [], { address: wallet });

    if (!foundWallet) {
      throw new Error('Cannot find wallet');
    }

    const provider = await foundWallet.getProvider();

    return new ethers.providers.Web3Provider(provider as ExternalProvider, 'any');
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
        address: wallet.address,
        label: wallet.address,
        getProvider: wallet.getEthersProvider,
      })),
    };

    if (!this.activeWallet) {
      void this.setActiveWallet(wallets[0].address);
    }
  }
}
