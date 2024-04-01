import { User, Wallet, WalletStatus, Account, UserStatus, Address, WalletType, AccountEns, ApiNewWallet } from '@types';
import { find, findIndex, isEqual } from 'lodash';
import Web3Service from './web3Service';
import { Connector } from 'wagmi';
import { getConnectorData } from '@common/utils/wagmi';
import { toWallet } from '@common/utils/accounts';
import MeanApiService from './meanApiService';
import { EventsManager } from './eventsManager';
import { WalletClient } from 'viem';

export const LAST_LOGIN_KEY = 'last_logged_in_with';
export const WALLET_SIGNATURE_KEY = 'wallet_auth_signature';

export interface AccountServiceData {
  user?: User;
  activeWallet?: Wallet;
  accounts: Account[];
  isLoggingUser: boolean;
}

const initialState: AccountServiceData = { accounts: [], isLoggingUser: false };
export default class AccountService extends EventsManager<AccountServiceData> {
  web3Service: Web3Service;

  signedWith?: Wallet;

  meanApiService: MeanApiService;

  openNewAccountModal?: (open: boolean) => void;

  constructor(web3Service: Web3Service, meanApiService: MeanApiService) {
    super(initialState);
    this.web3Service = web3Service;
    this.meanApiService = meanApiService;
  }

  get user() {
    return this.serviceData.user;
  }

  set user(user) {
    this.serviceData = { ...this.serviceData, user };
  }

  get activeWallet() {
    return this.serviceData.activeWallet;
  }

  set activeWallet(activeWallet) {
    this.serviceData = { ...this.serviceData, activeWallet };
  }

  get accounts() {
    return this.serviceData.accounts;
  }

  set accounts(accounts) {
    this.serviceData = { ...this.serviceData, accounts };
  }

  get isLoggingUser() {
    return this.serviceData.isLoggingUser;
  }

  set isLoggingUser(isLoggingUser) {
    this.serviceData = { ...this.serviceData, isLoggingUser };
  }

  getUser(): User | undefined {
    return this.serviceData.user;
  }

  getIsLoggingUser() {
    return this.serviceData.isLoggingUser;
  }

  setIsLoggingUser(isLoggingUser: boolean) {
    this.isLoggingUser = isLoggingUser;
  }

  getWallets(): Wallet[] {
    return this.user?.wallets || [];
  }

  setWalletsEns(ens: AccountEns): void {
    if (!this.user) {
      return;
    }

    const userWallets = this.user.wallets;

    this.user = {
      ...this.user,
      wallets: userWallets.map((wallet) => ({
        ...wallet,
        ens: ens[wallet.address],
      })),
    };
  }

  getWallet(address: string): Wallet {
    const wallet = find(this.user?.wallets, { address: address.toLowerCase() as Address });

    if (wallet) {
      return wallet;
    }

    throw new Error('Wallet not found');
  }

  getActiveWalletSigner() {
    if (!this.activeWallet) {
      return undefined;
    }

    return this.getWalletSigner(this.activeWallet.address);
  }

  getWalletSigner(wallet: string) {
    const foundWallet = find(this.user?.wallets || [], { address: wallet.toLowerCase() as Address });

    if (!foundWallet || foundWallet?.status !== WalletStatus.connected) {
      throw new Error('Cannot find wallet');
    }

    const walletClient = foundWallet.walletClient;

    return walletClient;
  }

  getActiveWallet(): Wallet | undefined {
    return this.activeWallet;
  }

  logoutUser() {
    this.serviceData = initialState;
    this.web3Service.logOutUser();
    localStorage.removeItem(WALLET_SIGNATURE_KEY);
  }

  async linkWallet({ connector, isAuth }: { connector?: Connector; isAuth: boolean }) {
    if (!this.user) {
      throw new Error('User is not connected');
    }

    if (!connector) {
      throw new Error('Connector not defined');
    }

    const { walletClient, providerInfo, address } = await getConnectorData(connector);

    let expirationDate;
    let expiration;
    let signature;

    let baseNewWallet: ApiNewWallet = {
      address,
      isAuth: false,
    };

    // walletClient.transport.type
    if (isAuth) {
      expirationDate = new Date();

      expirationDate.setMinutes(expirationDate.getMinutes() + 30);

      expiration = expirationDate.toString();

      signature = await walletClient.signMessage({
        message: `By signing this message you are authorizing the account ${this.user.label} (${this.user.id}) to add this wallet to it. This signature will expire on ${expiration}.`,
      });

      baseNewWallet = {
        ...baseNewWallet,
        isAuth: true,
        signature,
        expiration,
      };
    }

    const veryfingSignature = await this.getWalletVerifyingSignature({});

    await this.meanApiService.linkWallet({
      accountId: this.user.id,
      wallet: baseNewWallet,
      signature: veryfingSignature,
    });

    const wallet: Wallet = toWallet({
      address,
      status: WalletStatus.connected,
      walletClient,
      providerInfo,
      isAuth,
    });

    this.user = { ...this.user, wallets: [...this.user.wallets, wallet] };

    const accountIndex = findIndex(this.accounts, { id: this.user.id });

    if (accountIndex !== -1) {
      const accounts = { ...this.accounts };
      accounts[accountIndex].wallets = [...this.accounts[accountIndex].wallets, { address, isAuth }];
      this.accounts = accounts;
    } else {
      throw new Error('tried to link a wallet to a user that was not set');
    }
  }

  async logInUser(connector?: Connector): Promise<void> {
    if (this.user && this.user.status === UserStatus.loggedIn) {
      return this.linkWallet({ connector, isAuth: false });
    }

    let storedSignature = this.getStoredWalletSignature({});

    this.isLoggingUser = true;

    let wallet: Wallet | undefined;

    if (!storedSignature && !connector) {
      return;
    }

    if (connector) {
      const { address, providerInfo, walletClient } = await getConnectorData(connector);

      wallet = toWallet({
        address,
        status: WalletStatus.connected,
        walletClient: walletClient,
        providerInfo: providerInfo,
        isAuth: true,
      });
    }

    if (!storedSignature && wallet) {
      storedSignature = await this.getWalletVerifyingSignature({ walletClient: wallet.walletClient });
    }

    if (!storedSignature) return;

    const accountsResponse = await this.meanApiService.getAccounts({ signature: storedSignature });

    const accounts = accountsResponse.accounts;

    if (accounts.length) {
      const parsedWallets = accounts[0].wallets.map<Wallet>((accountWallet) =>
        accountWallet.address.toLowerCase() === wallet?.address
          ? wallet
          : toWallet({
              address: accountWallet.address,
              isAuth: accountWallet.isAuth,
              status: WalletStatus.disconnected,
            })
      );

      const walletIsInUser = find(parsedWallets, ({ address }) => address === wallet?.address);

      this.accounts = accounts;
      this.user = {
        id: this.accounts[0].id,
        label: this.accounts[0].label,
        status: UserStatus.loggedIn,
        wallets: parsedWallets,
        signature: storedSignature,
      };

      if (wallet && walletIsInUser) {
        await this.setActiveWallet(wallet.address);
      }
      // if (wallet?.address && (!this.activeWallet || this.activeWallet.address !== wallet.address)) {
      //   void this.setActiveWallet(wallet.address);
      // }
    } else {
      await this.createUser({ label: 'Personal', signature: storedSignature, wallet });
    }

    this.isLoggingUser = false;
  }

  async createUser({
    label,
    signature,
    wallet,
  }: {
    label: string;
    wallet?: Wallet;
    signature: { message: string; expiration: string; signer: `0x${string}` };
  }) {
    const newAccountId = await this.meanApiService.createAccount({
      label,
      signature,
    });

    const walletToSet: Wallet = wallet || {
      address: signature.signer,
      isAuth: true,
      type: WalletType.external,
      status: WalletStatus.disconnected,
      walletClient: undefined,
      providerInfo: undefined,
    };

    const newAccount: Account = {
      id: newAccountId.accountId,
      label,
      labels: {},
      contacts: [],
      wallets: [walletToSet],
    };

    this.accounts = [...this.accounts, newAccount];

    await this.changeUser(newAccountId.accountId, signature);
  }

  async changeUser(userId: string, signature?: { message: string; expiration: string; signer: `0x${string}` }) {
    const user = this.accounts.find(({ id }) => id === userId);

    if (!user) {
      throw new Error('User is not connected');
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

    this.user = {
      id: user.id,
      label: user.label,
      status: UserStatus.loggedIn,
      wallets: parsedWallets,
      signature,
    };

    if (!activeWalletIsInUserWallets) {
      await this.setActiveWallet(parsedWallets.find(({ isAuth }) => isAuth)!.address);
    }
  }

  async setActiveWallet(wallet: string): Promise<void> {
    this.activeWallet = find(this.user?.wallets || [], { address: wallet.toLowerCase() as Address })!;
    if (!this.activeWallet) {
      throw new Error('Cannot find wallet');
    }
    this.web3Service.setAccount(this.activeWallet.address);
    // Drill prop to react
    this.web3Service.setAccountCallback(this.activeWallet.address);
    if (this.activeWallet.status !== WalletStatus.connected) {
      throw new Error('Wallet is not connected');
    }

    const walletClient = this.activeWallet.walletClient;

    await this.web3Service.connect(walletClient, undefined, undefined);
    return;
  }

  async getWalletVerifyingSignature({
    address,
    forceAddressMatch,
    updateSignature = true,
    walletClient,
  }: {
    address?: Address;
    forceAddressMatch?: boolean;
    updateSignature?: boolean;
    walletClient?: WalletClient;
  }): Promise<{ message: string; expiration: string; signer: `0x${string}` }> {
    let signature;

    const storedSignature = this.getStoredWalletSignature({ address, forceAddressMatch });

    if (storedSignature) {
      signature = storedSignature;
    } else {
      let clientToUse = walletClient;
      let firstAdminWallet;

      if (!clientToUse && this.user && this.activeWallet) {
        const adminWallets = this.user?.wallets.filter(
          (wallet) => wallet.status === WalletStatus.connected && wallet.isAuth
        );

        firstAdminWallet = adminWallets?.length && adminWallets[0].address;

        if (!firstAdminWallet) throw new Error('No client can be found');
        clientToUse = this.getWalletSigner(firstAdminWallet);
      } else {
        firstAdminWallet = clientToUse?.account?.address;
      }

      if (!clientToUse) throw new Error('No available client');
      const addressToUse = address || firstAdminWallet || undefined;

      if (!addressToUse) {
        throw new Error('Address should be provided');
      }

      const expirationDate = new Date();

      expirationDate.setDate(expirationDate.getDate() + 30);

      const expiration = expirationDate.toString();

      const message = await clientToUse.signMessage({ message: `Sign in until ${expiration}`, account: addressToUse });

      signature = {
        expiration,
        message,
        signer: addressToUse,
      };
    }

    if (!isEqual(this.user?.signature, signature)) {
      localStorage.setItem(WALLET_SIGNATURE_KEY, JSON.stringify(signature));

      if (this.user && updateSignature) {
        this.user = { ...this.user, signature };
      }
    }

    return signature;
  }

  getStoredWalletSignature({
    address,
    forceAddressMatch,
  }: {
    address?: Address;
    forceAddressMatch?: boolean;
  }): { message: string; expiration: string; signer: `0x${string}` } | undefined {
    if (forceAddressMatch && !address) {
      throw new Error('Address should be provided for forceAddressMatch');
    }

    const today = new Date().getTime();

    if (
      this.user?.signature &&
      today < new Date(this.user.signature.expiration).getTime() &&
      (!forceAddressMatch || address === this.user.signature.signer)
    ) {
      return this.user.signature;
    }

    const lastSignatureRaw = localStorage.getItem(WALLET_SIGNATURE_KEY);
    let signature;
    if (lastSignatureRaw) {
      const lastSignature = JSON.parse(lastSignatureRaw) as { signer: Address; expiration: string; message: string };

      const lastExpiration = new Date(lastSignature.expiration).getTime();

      if (today < lastExpiration && (!forceAddressMatch || address === lastSignature.signer)) {
        signature = {
          expiration: lastSignature.expiration,
          message: lastSignature.message,
          signer: lastSignature.signer,
        };
      }
    }

    return signature;
  }

  async updateWallet({ connector }: { connector?: Connector }) {
    if (!this.user) {
      throw new Error('User is not connected');
    }

    if (!connector) {
      throw new Error('Connector not defined');
    }

    const { walletClient, providerInfo, address } = await getConnectorData(connector);

    const newWallet: Wallet = toWallet({
      address,
      status: WalletStatus.connected,
      walletClient,
      providerInfo,
      isAuth: true,
    });

    this.activeWallet = {
      ...newWallet,
    };

    const walletIndex = findIndex(this.user.wallets, { address });

    if (walletIndex !== -1) {
      const user = { ...this.user };
      const wallets = user.wallets.map<Wallet>((wallet) => ({
        ...wallet,
        status: WalletStatus.disconnected,
        walletClient: undefined,
        providerInfo: undefined,
      }));
      wallets[walletIndex] = { ...newWallet };
      user.wallets = wallets;
      this.user = user;
    }
  }
}
