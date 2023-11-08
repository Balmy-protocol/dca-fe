import { ConnectedWallet, User as BasePrivyUser, WalletWithMetadata } from '@privy-io/react-auth';
import { IAccountService, UserType, WalletType, User, Wallet, AccountLabels, WalletStatus } from '@types';
import { find } from 'lodash';
import Web3Service from './web3Service';
import { getProviderInfo } from '@common/utils/provider-info';
import { IProviderInfo } from '@common/utils/provider-info/types';
import { Connector } from 'wagmi';
import { ExternalProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';

export const LAST_LOGIN_KEY = 'last_logged_in_with';
export const WALLET_SIGNATURE_KEY = 'wallet_auth_signature';

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

    if (provider.getNetwork) {
      await provider.getNetwork();
    } else if (provider.detectNetwork) {
      await provider.detectNetwork();
    }

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
        } as Wallet;
      });

    const providerInfoPromises: Promise<IProviderInfo | undefined>[] = [];

    for (const userWallet of userWallets) {
      if (userWallet.getProvider) {
        const infoPromise = userWallet.getProvider()!.then((provider) =>
          getProviderInfo(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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

    localStorage.setItem(LAST_LOGIN_KEY, UserType.wallet);
  }

  async setExternalUser(connector?: Connector): Promise<void> {
    if (!connector) {
      return;
    }

    const baseProvider = (await connector.getProvider()) as ExternalProvider;

    const provider = new ethers.providers.Web3Provider(baseProvider, 'any');

    const address = (await provider.getSigner().getAddress()).toLowerCase();

    const wallet: Wallet = {
      type: WalletType.external,
      address,
      status: WalletStatus.connected,
      getProvider: async () =>
        new ethers.providers.Web3Provider((await connector.getProvider()) as ExternalProvider, 'any'),
      providerInfo: getProviderInfo(baseProvider),
    };

    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    this.user = {
      id: `wallet:${address}`,
      type: UserType.wallet,
      wallets: [wallet],
      signature: {
        message: '0x',
        expiration: tomorrow.toDateString(),
      },
    };

    if (!this.activeWallet || this.activeWallet.address !== address) {
      void this.setActiveWallet(address);
    }

    localStorage.setItem(LAST_LOGIN_KEY, UserType.wallet);

    await this.getWalletVerifyingSignature(address, this.user.signature.expiration);
  }

  async getWalletVerifyingSignature(address: string, expiration: string) {
    if (this.user?.type !== UserType.wallet) return;

    const lastSignatureRaw = localStorage.getItem(WALLET_SIGNATURE_KEY);

    if (lastSignatureRaw) {
      const lastSignature = JSON.parse(lastSignatureRaw) as { id: string; expiration: string; message: string };

      const lastExpiration = new Date(lastSignature.expiration).getTime();
      const today = new Date().getTime();

      if (lastSignature.id === this.user?.id && today < lastExpiration) {
        this.user.signature.expiration = lastSignature.expiration;
        this.user.signature.message = lastSignature.message;

        return;
      }
    }

    const signer = await this.getWalletSigner(address);

    const message = await signer.signMessage(`Sign in until ${expiration}`);

    this.user.signature.message = message;
    this.user.signature.expiration = expiration;

    localStorage.setItem(
      WALLET_SIGNATURE_KEY,
      JSON.stringify({
        id: this.user.id,
        expiration,
        message,
      })
    );
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

  getLastLoggedInWith(): UserType {
    const lastLoggedInWith = localStorage.getItem(LAST_LOGIN_KEY) as UserType;

    return lastLoggedInWith;
  }
}
