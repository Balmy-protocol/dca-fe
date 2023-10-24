import { ConnectedWallet, User as BasePrivyUser, WalletWithMetadata } from '@privy-io/react-auth';
import { IAccountService, UserType, WalletType, User, Wallet, AccountLabels, WalletStatus } from '@types';
import { find } from 'lodash';
import Web3Service from './web3Service';
import { getProviderInfo } from '@common/utils/provider-info';
import { IProviderInfo } from '@common/utils/provider-info/types';

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
    if (!this.activeWallet || this.activeWallet.status !== WalletStatus.connected) {
      throw new Error('Cannot find wallet');
    }
    const provider = await this.activeWallet.getProvider();

    await this.web3Service.connect(provider, undefined, undefined);
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

    if (!foundWallet || foundWallet?.status !== WalletStatus.connected) {
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

  getWallet(address: string): Wallet {
    const wallet = find(this.user?.wallets, { address: address.toLowerCase() });

    if (wallet) {
      return wallet;
    }

    throw new Error('Wallet not found');
  }

  async setUser(user?: BasePrivyUser, wallets?: ConnectedWallet[]): Promise<void> {
    if (!user || !wallets) {
      this.user = undefined;
      this.activeWallet = undefined;
      return;
    }

    const userWallets = user.linkedAccounts
      .filter((account) => account.type === 'wallet')
      .map<Wallet>((walletAccount: WalletWithMetadata) => {
        const readyWallet = wallets.find(
          (wallet) => wallet.address.toLowerCase() === walletAccount.address.toLowerCase()
        );

        return {
          type: walletAccount.walletClientType === 'privy' ? WalletType.embedded : WalletType.external,
          address: walletAccount.address.toLowerCase(),
          status: !!readyWallet ? WalletStatus.connected : WalletStatus.disconnected,
          getProvider: readyWallet?.getEthersProvider,
          switchChain: readyWallet?.switchChain,
        } as Wallet;
      });

    const providerInfoPromises: Promise<IProviderInfo | undefined>[] = [];

    for (const userWallet of userWallets) {
      if (userWallet.getProvider) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const infoPromise = userWallet
          .getProvider()
          .then((provider) =>
            getProviderInfo(
              provider.provider.walletProvider?.walletProvider || provider,
              userWallet.type === WalletType.embedded
            )
          );
        providerInfoPromises.push(infoPromise);
      } else {
        providerInfoPromises.push(Promise.resolve(undefined));
      }
    }

    const providerInfos = await Promise.all(providerInfoPromises);

    providerInfos.forEach((providerInfo, index) => {
      userWallets[index].providerInfo = providerInfo;
    });

    this.user = {
      id: `privy:${user.id}`,
      type: UserType.privy,
      privyUser: user,
      wallets: userWallets,
    };

    const embeddedWallet = find(this.user.wallets, { type: WalletType.embedded });

    if (!this.activeWallet) {
      void this.setActiveWallet(embeddedWallet?.address || wallets[0].address);
    }
  }

  setWalletsLabels(labels: AccountLabels): void {
    if (!this.user) {
      return;
    }

    const userWallets = this.user.wallets;

    this.user = {
      ...this.user,
      wallets: userWallets.map((wallet) => ({
        ...wallet,
        label: labels[wallet.address],
      })),
    };
  }
}
