import {
  User,
  Wallet,
  AccountLabels,
  WalletStatus,
  Account,
  UserStatus,
  ApiNewWallet,
  ApiWalletAdminConfig,
} from '@types';
import { find, findIndex } from 'lodash';
import Web3Service from './web3Service';
import { Connector } from 'wagmi';
import { getConnectorData } from '@common/utils/wagmi';
import { toWallet } from '@common/utils/accounts';

export const LAST_LOGIN_KEY = 'last_logged_in_with';
export const WALLET_SIGNATURE_KEY = 'wallet_auth_signature';

export default class AccountService {
  user?: User;

  activeWallet?: Wallet;

  web3Service: Web3Service;

  accounts: Account[];

  signedWith?: Wallet;

  openNewAccountModal?: (open: boolean) => void;

  constructor(web3Service: Web3Service) {
    this.web3Service = web3Service;
    this.accounts = [];
  }

  getUser(): User | undefined {
    return this.user;
  }

  getWallets(): Wallet[] {
    return this.user?.wallets || [];
  }

  async setActiveWallet(wallet: string): Promise<void> {
    this.activeWallet = find(this.user?.wallets || [], { address: wallet.toLowerCase() })!;
    if (!this.activeWallet) {
      throw new Error('Cannot find wallet');
    }
    this.web3Service.setAccount(this.activeWallet.address);
    // Drill prop to react
    this.web3Service.setAccountCallback(this.activeWallet.address);
    if (this.activeWallet.status !== WalletStatus.connected) {
      throw new Error('Wallet is not connected');
    }

    const provider = await this.activeWallet.getProvider();

    await this.web3Service.connect(provider, undefined, undefined);
    return;
  }

  getAccounts(): Account[] {
    return this.accounts;
  }

  setOpenNewAccountModalHandler(openNewAccountModal: (open: boolean) => void) {
    this.openNewAccountModal = openNewAccountModal;
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

  getSignInWallet(): Wallet | undefined {
    return this.signedWith;
  }

  getWallet(address: string): Wallet {
    const wallet = find(this.user?.wallets, { address: address.toLowerCase() });

    if (wallet) {
      return wallet;
    }

    throw new Error('Wallet not found');
  }

  logoutUser() {
    this.user = undefined;
    this.activeWallet = undefined;
    localStorage.removeItem(WALLET_SIGNATURE_KEY);
  }

  async changeUser(userId: string) {
    const user = this.accounts.find(({ id }) => id === userId);

    if (!user) {
      throw new Error('User is not connected');
    }

    if (!this.activeWallet) {
      throw new Error('Active wallet not found');
    }

    if (!this.signedWith) {
      throw new Error('Signed in wallet not found');
    }

    const activeWalletIsInUserWallets = !!user.wallets.find(
      (userWallet) => userWallet.address === this.activeWallet?.address
    );

    const parsedWallets = user.wallets.map<Wallet>((accountWallet) =>
      accountWallet.address.toLowerCase() === this.activeWallet!.address
        ? this.activeWallet!
        : toWallet({
            address: accountWallet.address,
            isAuth: accountWallet.isAuth,
            status: WalletStatus.disconnected,
          })
    );

    if (!activeWalletIsInUserWallets) {
      await this.setActiveWallet(this.signedWith.address);
    }

    this.user = {
      id: user.id,
      label: user.label,
      status: UserStatus.loggedIn,
      wallets: parsedWallets,
    };
  }

  async logInUser(connector?: Connector): Promise<void> {
    if (!connector) {
      throw new Error('Connector not defined');
    }

    if (this.user && this.user.status === UserStatus.loggedIn) {
      return this.linkWallet({ connector, isAuth: false });
    }

    const { address, providerInfo, provider } = await getConnectorData(connector);

    const wallet: Wallet = toWallet({
      address,
      status: WalletStatus.connected,
      getProvider: () => Promise.resolve(provider),
      providerInfo: providerInfo,
      isAuth: true,
    });

    const meanApiService = this.web3Service.getMeanApiService();

    this.user = {
      id: 'pending',
      label: 'New Account',
      wallets: [wallet],
      status: UserStatus.notLogged,
    };

    if (!this.activeWallet || this.activeWallet.address !== address) {
      void this.setActiveWallet(address);
    }

    const accountsResponse = await meanApiService.getAccounts();

    this.accounts = accountsResponse.accounts;

    if (this.accounts.length) {
      const parsedWallets = this.accounts[0].wallets.map<Wallet>((accountWallet) =>
        accountWallet.address.toLowerCase() === wallet.address
          ? wallet
          : toWallet({
              address: accountWallet.address,
              isAuth: accountWallet.isAuth,
              status: WalletStatus.disconnected,
            })
      );

      this.user = {
        id: this.accounts[0].id,
        label: this.accounts[0].label,
        status: UserStatus.loggedIn,
        wallets: parsedWallets,
      };
    } else {
      this.user.status = UserStatus.loggedIn;
    }

    this.signedWith = this.activeWallet;

    if (!this.accounts.length && this.openNewAccountModal) {
      this.openNewAccountModal(true);
    }
  }

  async createUser({ label }: { label: string }) {
    if (!this.user) {
      throw new Error('User is not connected');
    }

    if (!this.activeWallet) {
      throw new Error('Should be an active wallet for this');
    }

    const meanApiService = this.web3Service.getMeanApiService();

    // update saved signature
    await this.getWalletVerifyingSignature({
      forceAddressMatch: true,
      address: this.activeWallet.address,
    });

    const newAccountId = await meanApiService.createAccount({
      label,
    });

    const newAccount = {
      id: newAccountId.accountId,
      label,
      labels: {},
      contacts: [],
      wallets: [
        {
          address: this.activeWallet.address,
          isAuth: true,
        },
      ],
    };

    this.accounts = [...this.accounts, newAccount];

    await this.changeUser(newAccountId.accountId);
  }

  async linkWallet({ connector, isAuth }: { connector?: Connector; isAuth: boolean }) {
    if (!this.user) {
      throw new Error('User is not connected');
    }

    if (!connector) {
      throw new Error('Connector not defined');
    }

    const { provider, providerInfo, signer, address } = await getConnectorData(connector);

    let expirationDate;
    let expiration;
    let signature;

    let baseNewWallet: ApiNewWallet = {
      address,
      isAuth: false,
    };

    if (isAuth) {
      expirationDate = new Date();

      expirationDate.setMinutes(expirationDate.getMinutes() + 30);

      expiration = expirationDate.toString();

      signature = await signer.signMessage(
        `By signing this message you are authorizing the account ${this.user.label} (${this.user.id}) to add this wallet to it. This signature will expire on ${expiration}.`
      );

      baseNewWallet = {
        ...baseNewWallet,
        isAuth: true,
        signature,
        expiration,
      };
    }

    const meanApiService = this.web3Service.getMeanApiService();

    await meanApiService.linkWallet({
      wallet: baseNewWallet,
    });

    const wallet: Wallet = toWallet({
      address,
      status: WalletStatus.connected,
      getProvider: async () => Promise.resolve(provider),
      providerInfo,
      isAuth,
    });

    this.user.wallets = [...this.user.wallets, wallet];

    const accountIndex = findIndex(this.accounts, { id: this.user.id });

    if (accountIndex !== -1) {
      this.accounts[accountIndex].wallets = [...this.accounts[accountIndex].wallets, { address, isAuth }];
    } else {
      throw new Error('tried to link a wallet to a user that was not set');
    }
  }

  async updateWallet({ connector }: { connector?: Connector }) {
    if (!this.user) {
      throw new Error('User is not connected');
    }

    if (!connector) {
      throw new Error('Connector not defined');
    }

    const { provider, providerInfo, address } = await getConnectorData(connector);

    const newWallet: Wallet = toWallet({
      address,
      status: WalletStatus.connected,
      getProvider: async () => Promise.resolve(provider),
      providerInfo,
      isAuth: true,
    });

    this.activeWallet = {
      ...newWallet,
    };

    const walletIndex = findIndex(this.user.wallets, { address });

    if (walletIndex !== -1) {
      this.user.wallets[walletIndex] = {
        ...newWallet,
      };
    }
  }

  async getWalletVerifyingSignature({
    address,
    forceAddressMatch,
    updateSignature = true,
  }: {
    address?: string;
    forceAddressMatch?: boolean;
    updateSignature?: boolean;
  }) {
    if (!this.user) {
      throw new Error('User not defined');
    }

    if (forceAddressMatch && !address) {
      throw new Error('Address should be provided for forceAddressMatch');
    }

    const today = new Date().getTime();

    if (
      this.user.signature &&
      today < new Date(this.user.signature.expiration).getTime() &&
      (!forceAddressMatch || address === this.user.signature.signer)
    ) {
      return this.user.signature;
    }

    const adminWallets = this.user.wallets.filter(
      (wallet) => wallet.status === WalletStatus.connected && wallet.isAuth
    );

    const addressToUse = address || (adminWallets.length && adminWallets[0].address) || undefined;

    const lastSignatureRaw = localStorage.getItem(WALLET_SIGNATURE_KEY);
    let signature;
    if (lastSignatureRaw) {
      const lastSignature = JSON.parse(lastSignatureRaw) as { id: string; expiration: string; message: string };

      const lastExpiration = new Date(lastSignature.expiration).getTime();

      const adminWalletsAddresses = forceAddressMatch ? [address] : adminWallets.map((wallet) => wallet.address);
      if (adminWalletsAddresses.includes(lastSignature.id) && today < lastExpiration) {
        signature = {
          expiration: lastSignature.expiration,
          message: lastSignature.message,
          signer: lastSignature.id,
        };
      }
    }

    if (signature && updateSignature) {
      this.user.signature = signature;
      return signature;
    }

    if (!addressToUse) {
      throw new Error('Address should be provided');
    }

    const expirationDate = new Date();

    expirationDate.setDate(expirationDate.getDate() + 1);

    const expiration = expirationDate.toString();

    const signer = await this.getWalletSigner(addressToUse);

    const message = await signer.signMessage(`Sign in until ${expiration}`);

    signature = {
      expiration,
      message,
      signer: addressToUse,
    };

    if (updateSignature) {
      localStorage.setItem(
        WALLET_SIGNATURE_KEY,
        JSON.stringify({
          id: addressToUse,
          expiration,
          message,
        })
      );
      this.user.signature = signature;
    }

    return signature;
  }

  async getWalletLinkSignature({ address }: { address: string }) {
    if (!this.user) {
      throw new Error('User not defined');
    }

    const signer = await this.getWalletSigner(address);

    const expirationDate = new Date();

    expirationDate.setMinutes(expirationDate.getMinutes() + 30);

    const expiration = expirationDate.toString();

    const signatureMessage = await signer.signMessage(
      `By signing this message you are authorizing the account ${this.user.label} (${this.user.id}) to add this wallet to it. This signature will expire on ${expiration}.`
    );

    return {
      message: signatureMessage,
      expiration,
    };
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

  async changeWalletAdmin({ address, isAuth, userId }: { address: string; isAuth: boolean; userId: string }) {
    const accountIndex = findIndex(this.accounts, { id: userId });

    if (accountIndex === -1) {
      throw new Error('Account not found');
    }

    const walletIndex = findIndex(this.accounts[accountIndex].wallets, { address });

    if (walletIndex === -1) {
      throw new Error('Wallet not found');
    }

    const meanApiService = this.web3Service.getMeanApiService();

    let walletConfig: ApiWalletAdminConfig;

    // typescript hacky hacky
    if (isAuth) {
      const signature = await this.getWalletLinkSignature({
        address,
      });

      walletConfig = {
        isAuth,
        signature: signature.message,
        expiration: signature.expiration,
      };
    } else {
      walletConfig = { isAuth };
    }

    await meanApiService.modifyWallet({
      address,
      walletConfig,
      accountId: userId,
    });

    this.accounts[accountIndex].wallets[walletIndex].isAuth = isAuth;

    if (this.user?.id === userId) {
      const userWalletIndex = findIndex(this.user.wallets, { address });

      if (userWalletIndex !== -1) {
        this.user.wallets[userWalletIndex].isAuth = isAuth;
      }
    }
  }
}
