import {
  User,
  Wallet,
  WalletStatus,
  Account,
  UserStatus,
  Address,
  WalletType,
  AccountEns,
  ApiNewWallet,
  WalletSignature,
} from '@types';
import { find, findIndex, isEqual, uniqBy } from 'lodash';
import Web3Service from './web3Service';
import { Connector } from 'wagmi';
import { getConnectorData } from '@common/utils/wagmi';
import { toWallet } from '@common/utils/accounts';
import MeanApiService from './meanApiService';
import { EventsManager } from './eventsManager';
import { WalletClient } from 'viem';
import { timeoutPromise } from '@mean-finance/sdk';

export const LAST_LOGIN_KEY = 'last_logged_in_with';
export const WALLET_SIGNATURE_KEY = 'wallet_auth_signature';
export const LATEST_SIGNATURE_VERSION = '1.0.1';
export const LATEST_SIGNATURE_VERSION_KEY = 'wallet_auth_signature_key';
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
    this.resetData();
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

    const isWalletLinked = this.user.wallets.find((wallet) => wallet.address === address);
    if (isWalletLinked) {
      return this.updateWallet({ connector });
    }

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
      const accounts = [...this.accounts];
      accounts[accountIndex].wallets = [...this.accounts[accountIndex].wallets, { address, isAuth }];
      this.accounts = accounts;
    } else {
      throw new Error('tried to link a wallet to a user that was not set');
    }
  }

  async logInUser(connector?: Connector, connectors?: Connector[]): Promise<void> {
    if (this.user && this.user.status === UserStatus.loggedIn) {
      return this.linkWallet({ connector, isAuth: false });
    }

    let storedSignature = this.getStoredWalletSignature();

    this.isLoggingUser = true;

    let wallet: Wallet | undefined;

    if (!storedSignature && !connector) {
      this.isLoggingUser = false;
      return;
    }

    try {
      const safeWallets = [];
      for (const walletConnector of connectors || []) {
        try {
          const { address, providerInfo, walletClient } = await timeoutPromise(getConnectorData(walletConnector), '1s');

          safeWallets.push(
            toWallet({
              address,
              status: WalletStatus.connected,
              walletClient: walletClient,
              providerInfo: providerInfo,
              isAuth: true,
            })
          );
        } catch (e) {
          console.log('Failed to parse safe wallet connector', walletConnector, e);
        }
      }
      console.log(safeWallets);
    } catch (e) {
      console.log('Safe failed');
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

    if (!storedSignature) {
      this.isLoggingUser = true;
      return;
    }

    const accountsResponse = await this.meanApiService.getAccounts({ signature: storedSignature });

    const accounts = accountsResponse.accounts;

    if (accounts.length) {
      let connectedWallets: Wallet[] = [...(wallet ? [wallet] : [])];

      for (const walletConnector of connectors || []) {
        try {
          const { address, providerInfo, walletClient } = await timeoutPromise(getConnectorData(walletConnector), '1s');

          connectedWallets.push(
            toWallet({
              address,
              status: WalletStatus.connected,
              walletClient: walletClient,
              providerInfo: providerInfo,
              isAuth: true,
            })
          );
        } catch (e) {
          console.error('Failed to parse wallet connector', walletConnector, e);
        }
      }

      connectedWallets = uniqBy(connectedWallets, 'address');
      const parsedWallets = accounts[0].wallets.map<Wallet>((accountWallet) => {
        const foundWallet = connectedWallets.find(({ address }) => accountWallet.address.toLowerCase() === address);
        if (foundWallet) {
          return {
            ...foundWallet,
            isAuth: accountWallet.isAuth,
          };
        }

        return toWallet({
          address: accountWallet.address,
          isAuth: accountWallet.isAuth,
          status: WalletStatus.disconnected,
        });
      });

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
        this.setActiveWallet(wallet.address);
      }
    } else {
      await this.createUser({ label: 'Personal', signature: storedSignature, wallet });
    }

    this.isLoggingUser = false;
  }

  async createUser({ label, signature, wallet }: { label: string; wallet?: Wallet; signature: WalletSignature }) {
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

    this.changeUser(newAccountId.accountId, signature, walletToSet);
  }

  changeUser(userId: string, signature?: WalletSignature, signedInWallet?: Wallet) {
    const user = this.accounts.find(({ id }) => id === userId);

    if (!user) {
      throw new Error('User is not connected');
    }

    const activeWalletIsInUserWallets = !!user.wallets.find(
      (userWallet) => userWallet.address === this.activeWallet?.address
    );

    const parsedWallets = user.wallets.map<Wallet>((accountWallet) =>
      accountWallet.address.toLowerCase() === this.activeWallet?.address
        ? this.activeWallet
        : accountWallet.address === signedInWallet?.address
        ? signedInWallet
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
      const walletToSetAsActive = parsedWallets.find(({ isAuth }) => isAuth)?.address || signedInWallet?.address;

      if (walletToSetAsActive) {
        this.setActiveWallet(walletToSetAsActive);
      }
    }
  }

  setActiveWallet(wallet: string) {
    this.activeWallet = find(this.user?.wallets || [], { address: wallet.toLowerCase() as Address })!;
    if (!this.activeWallet) {
      throw new Error('Cannot find wallet');
    }
    this.web3Service.setAccount(this.activeWallet.address);

    // For arcx we dont care about the chainId of this
    this.web3Service.arcXConnect(wallet as Address, 1);
    return;
  }

  async unlinkWallet(wallet: Address) {
    const user = this.user;
    if (!user) {
      throw new Error('Cant delete a wallet from a non-existen user');
    }
    if (user.wallets.length === 1) {
      throw new Error('Cant delete the only wallet from a user');
    }

    const walletToRemove = user.wallets.find(({ address }) => address.toLowerCase() === wallet.toLowerCase());

    if (!walletToRemove) {
      throw new Error('The wallet is not in the current user');
    }

    const newUserWallets = user.wallets.filter(({ address }) => address.toLowerCase() !== wallet.toLowerCase());

    const otherAuthWallet = newUserWallets.find(({ isAuth }) => isAuth);

    if (!otherAuthWallet) {
      throw new Error('Cannot remove the only admin wallet of a user');
    }

    const veryfingSignature = await this.getWalletVerifyingSignature({});

    await this.meanApiService.unlinkWallet({
      address: wallet,
      accountId: user.id,
      signature: veryfingSignature,
    });

    this.user = {
      ...user,
      wallets: newUserWallets,
    };

    const modifiedAccounts = this.accounts.map((account) =>
      account.id === user.id ? { ...account, wallets: newUserWallets } : account
    );

    this.accounts = modifiedAccounts;

    this.setActiveWallet(otherAuthWallet.address);
  }

  async getWalletVerifyingSignature({
    address,
    updateSignature = true,
    walletClient,
  }: {
    address?: Address;
    updateSignature?: boolean;
    walletClient?: WalletClient;
  }): Promise<WalletSignature> {
    let signature;

    const storedSignature = this.getStoredWalletSignature();

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

      const message = await clientToUse.signMessage({
        message:
          'Welcome to Balmy! Sign in securely to your Balmy account by authenticating with your primary wallet.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nYour authentication will remain active, allowing you to seamlessly access your account and explore the world of decentralized home banking.',
        account: addressToUse,
      });

      signature = {
        message,
        signer: addressToUse.toLowerCase() as Address,
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

  getStoredWalletSignature(): WalletSignature | undefined {
    if (this.user?.signature) {
      return this.user.signature;
    }

    const lastSignatureRaw = localStorage.getItem(WALLET_SIGNATURE_KEY);
    let signature;
    if (lastSignatureRaw) {
      const lastSignature = JSON.parse(lastSignatureRaw) as { signer: Address; message: string };

      signature = {
        message: lastSignature.message,
        signer: lastSignature.signer.toLowerCase() as Address,
      };
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

    const walletIndex = findIndex(this.user.wallets, { address });

    if (walletIndex !== -1) {
      const user = { ...this.user };
      // @ts-expect-error ts doesnt know shit
      const wallets = user.wallets.map<Wallet>((wallet) => ({
        ...wallet,
        status:
          wallet.providerInfo?.id === this.activeWallet?.providerInfo?.id ? WalletStatus.disconnected : wallet.status,
      }));
      wallets[walletIndex] = { ...newWallet };
      user.wallets = wallets;
      this.user = user;

      this.setActiveWallet(newWallet.address);
    }
  }
}
