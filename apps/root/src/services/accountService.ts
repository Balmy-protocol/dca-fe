import {
  User,
  Wallet,
  WalletStatus,
  Account,
  UserStatus,
  Address,
  WalletType,
  ApiNewWallet,
  WalletSignature,
  ApiWallet,
} from '@types';
import { find, findIndex, isEqual, uniqBy } from 'lodash';
import Web3Service from './web3Service';
// import { Connector } from 'wagmi';
// import { getConnectorData } from '@common/utils/wagmi';
import { toWallet } from '@common/utils/accounts';
import MeanApiService from './meanApiService';
import { EventsManager } from './eventsManager';
import { WalletClient } from 'viem';
import { MAIN_NETWORKS } from '@constants';
import { SavedCustomConfig } from '@state/base-types';
import WalletClientsService, { AvailableProvider } from './walletClientsService';
import TierService from './tierService';

export const LAST_LOGIN_KEY = 'last_logged_in_with';
export const WALLET_SIGNATURE_KEY = 'wallet_auth_signature';
export const LATEST_SIGNATURE_VERSION = '1.0.2';
export const LATEST_SIGNATURE_VERSION_KEY = 'wallet_auth_signature_key';
export interface AccountServiceData {
  user?: User;
  activeWallet?: Address;
  accounts: Account[];
  isLoggingUser: boolean;
  earlyAccessEnabled?: boolean;
}

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export enum WalletActionType {
  link = 'link',
  connect = 'connect',
  none = 'none',
  reconnect = 'reconnect',
}

const initialState: AccountServiceData = { accounts: [], isLoggingUser: false };
export default class AccountService extends EventsManager<AccountServiceData> {
  web3Service: Web3Service;

  signedWith?: Wallet;

  meanApiService: MeanApiService;

  openNewAccountModal?: (open: boolean) => void;

  walletActionType: WalletActionType;

  walletClientService: WalletClientsService;

  tierService: TierService;

  switchActiveWalletOnConnection: boolean;

  constructor(
    web3Service: Web3Service,
    meanApiService: MeanApiService,
    walletClientsService: WalletClientsService,
    tierService: TierService
  ) {
    super(initialState);
    this.web3Service = web3Service;
    this.walletClientService = walletClientsService;
    this.meanApiService = meanApiService;
    this.tierService = tierService;
    this.walletActionType = WalletActionType.none;
    this.switchActiveWalletOnConnection = true;
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

  get earlyAccessEnabled() {
    return this.serviceData.earlyAccessEnabled;
  }

  set earlyAccessEnabled(earlyAccessEnabled) {
    this.serviceData = { ...this.serviceData, earlyAccessEnabled };
  }

  setWalletActionType(walletActionType: WalletActionType) {
    this.walletActionType = walletActionType;
  }

  getUser(): User | undefined {
    return this.serviceData.user;
  }

  getIsLoggingUser() {
    return this.serviceData.isLoggingUser;
  }

  getEarlyAccessEnabled() {
    return this.serviceData.earlyAccessEnabled;
  }

  getWallets(): Wallet[] {
    return this.user?.wallets || [];
  }

  setSwitchActiveWalletOnConnection(switchActiveWalletOnConnection: boolean) {
    this.switchActiveWalletOnConnection = switchActiveWalletOnConnection;
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

    return this.getWalletSigner(this.activeWallet);
  }

  getWalletSigner(wallet: string) {
    const foundWallet = find(this.user?.wallets || [], { address: wallet.toLowerCase() as Address });

    if (!foundWallet || foundWallet?.status !== WalletStatus.connected) {
      throw new Error('Cannot find wallet');
    }

    return this.walletClientService.getWalletClient(foundWallet.address);
  }

  getActiveWallet(): Wallet | undefined {
    const foundWallet = find(this.user?.wallets || [], { address: this.activeWallet });

    return foundWallet!;
  }

  logoutUser() {
    this.resetData();
    this.web3Service.logOutUser();
    localStorage.removeItem(WALLET_SIGNATURE_KEY);
  }

  updateWallets(providers: Record<Address, AvailableProvider>, affectedWallet?: Address) {
    const user = this.getUser();
    const wallets = user?.wallets || [];
    let newActiveWallet;
    const newlyConnectedWallets = Object.values(providers).filter(({ status, address }) => {
      return status === 'connected' && !wallets.find((wallet) => wallet.address === address);
    });
    const updatedWallets = wallets.map((wallet) => {
      const provider = providers[wallet.address];
      const previousStatus = wallet.status;
      if (provider) {
        if (provider.status === 'connected' && previousStatus === WalletStatus.disconnected) {
          newActiveWallet = wallet.address;
        }
        return {
          ...wallet,
          status: provider.status === 'connected' ? WalletStatus.connected : WalletStatus.disconnected,
        };
      }

      return wallet;
    });

    if (user) {
      this.user = { ...user, wallets: updatedWallets };
    }

    const affectedConnectionWallet = newlyConnectedWallets.find(
      ({ address }) => address.toLowerCase() === affectedWallet?.toLowerCase()
    );

    if (this.walletActionType === WalletActionType.link && !newActiveWallet) {
      void this.linkWallet({ connector: affectedConnectionWallet, isAuth: false });
    }

    if (!user && this.walletActionType === WalletActionType.connect && newlyConnectedWallets.length) {
      void this.logInUser(affectedConnectionWallet);
    }

    if (
      newActiveWallet &&
      this.switchActiveWalletOnConnection &&
      (this.walletActionType === WalletActionType.none || this.walletActionType === WalletActionType.connect)
    ) {
      this.setActiveWallet(newActiveWallet);
    }
  }

  async linkWallet({ connector, isAuth }: { connector?: AvailableProvider; isAuth: boolean }) {
    if (this.walletActionType !== WalletActionType.link) return;
    this.setWalletActionType(WalletActionType.none);

    if (!this.user) {
      throw new Error('User is not connected');
    }

    if (!connector) {
      throw new Error('Connector not defined');
    }

    const { address } = connector;

    const isWalletLinked = this.user.wallets.find((wallet) => wallet.address === address);
    if (isWalletLinked) {
      return;
    }

    let expirationDate;
    let expiration;
    let signature;

    let baseNewWallet: ApiNewWallet = {
      address,
      isAuth: false,
    };

    if (isAuth) {
      const walletClient = await this.walletClientService.getWalletClient(address);
      if (!walletClient || !walletClient.signMessage) {
        throw new Error('No wallet client found');
      }
      expirationDate = new Date();

      expirationDate.setMinutes(expirationDate.getMinutes() + 30);

      expiration = expirationDate.toString();

      signature = await walletClient.signMessage({
        account: address,
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
      isAuth,
    });

    this.user = { ...this.user, wallets: [...this.user.wallets, wallet] };

    const accountIndex = findIndex(this.accounts, { id: this.user.id });

    if (accountIndex !== -1) {
      const accounts = [...this.accounts];
      accounts[accountIndex].wallets = [...this.accounts[accountIndex].wallets, { address, isAuth, isOwner: isAuth }];
      this.accounts = accounts;
    } else {
      throw new Error('tried to link a wallet to a user that was not set');
    }

    this.setActiveWallet(address);

    this.tierService
      .pollUser()
      .then(() => this.tierService.calculateAndSetUserTier())
      .catch(() => {
        console.error('Failed to poll user on link');
      });
  }

  async logInUser(availableProvider?: AvailableProvider): Promise<void> {
    if (this.walletActionType !== WalletActionType.connect) return;
    this.setWalletActionType(WalletActionType.none);

    if (this.isLoggingUser) return;

    let storedSignature;

    try {
      storedSignature = this.getStoredWalletSignature();
    } catch (e) {
      console.error('Failed to get stored signature');
    }

    this.isLoggingUser = true;

    let wallet: Wallet | undefined;

    if (!storedSignature && !availableProvider) {
      this.isLoggingUser = false;
      return;
    }

    if (availableProvider) {
      const { address } = availableProvider;
      wallet = toWallet({
        address,
        status: WalletStatus.connected,
        isAuth: true,
        isOwner: true,
      });
    }

    if (!storedSignature && wallet) {
      try {
        storedSignature = await this.getWalletVerifyingSignature({ address: wallet.address });
      } catch (e) {
        this.isLoggingUser = false;
        return;
      }
    }

    if (!storedSignature) {
      this.isLoggingUser = true;
      return;
    }

    const accountsResponse = await this.meanApiService.getAccounts({ signature: storedSignature });

    const accounts = accountsResponse.accounts;

    if (accounts.length) {
      let connectedWallets: Wallet[] = [...(wallet ? [wallet] : [])];

      connectedWallets = uniqBy(connectedWallets, 'address');
      const parsedWallets = accounts[0].wallets.map<Wallet>((accountWallet) => {
        const foundWallet = connectedWallets.find(({ address }) => accountWallet.address.toLowerCase() === address);
        if (foundWallet) {
          return {
            ...foundWallet,
            isAuth: accountWallet.isAuth,
            isOwner: accountWallet.isOwner,
          };
        }

        return toWallet({
          address: accountWallet.address,
          isAuth: accountWallet.isAuth,
          status: WalletStatus.disconnected,
          isOwner: accountWallet.isOwner,
        });
      });

      this.accounts = accounts;
      this.user = {
        id: this.accounts[0].id,
        label: this.accounts[0].label,
        status: UserStatus.loggedIn,
        wallets: parsedWallets,
        signature: storedSignature,
      };

      const config = accounts[0].config;

      if (config) {
        this.web3Service.onUpdateConfig(config);
      }

      const earn = accounts[0].earn;
      if (earn) {
        this.earlyAccessEnabled = earn.earlyAccess;
      }

      if (earn?.inviteCodes) {
        this.tierService.setReferrals(earn.referrals);
        this.tierService.setInviteCodes(earn.inviteCodes);
        this.tierService.setAchievements(
          parsedWallets.map((parsedWallet) => parsedWallet.address),
          earn.achievements,
          earn.twitterShare
        );
        this.tierService.calculateAndSetUserTier();
      }

      try {
        void this.web3Service.analyticsService.identifyUser(this.user.id);
        void this.web3Service.analyticsService.trackEvent('User sign in', {
          with: wallet?.address,
        });
      } catch {}

      this.setActiveWallet(wallet?.address || parsedWallets[0].address);
    } else {
      await this.createUser({ label: 'Personal', signature: storedSignature, wallet });
      try {
        void this.web3Service.analyticsService.identifyUser(this.user?.id);
        void this.web3Service.analyticsService.trackEvent('User sign up', {
          with: wallet?.address,
        });
      } catch {}
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
      isOwner: true,
    };

    const newAccount: Account = {
      id: newAccountId.accountId,
      label,
      labels: {},
      contacts: [],
      wallets: [{ ...walletToSet }],
    };

    this.accounts = [...this.accounts, newAccount];

    this.changeUser(newAccountId.accountId, signature, walletToSet);

    this.tierService.calculateAndSetUserTier();
  }

  changeUser(userId: string, signature?: WalletSignature, signedInWallet?: Wallet) {
    const user = this.accounts.find(({ id }) => id === userId);

    if (!user) {
      throw new Error('User is not connected');
    }

    const activeWalletIsInUserWallets = !!user.wallets.find((userWallet) => userWallet.address === this.activeWallet);

    const parsedWallets = user.wallets.map<Wallet>((accountWallet) =>
      accountWallet.address.toLowerCase() === this.activeWallet
        ? this.getActiveWallet()!
        : accountWallet.address === signedInWallet?.address
          ? signedInWallet
          : toWallet({
              address: accountWallet.address,
              isAuth: accountWallet.isAuth,
              isOwner: accountWallet.isOwner,
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

    this.tierService.calculateAndSetUserTier();
  }

  setActiveWallet(wallet: string) {
    const newActiveWallet = find(this.user?.wallets || [], { address: wallet.toLowerCase() as Address })?.address;
    if (!newActiveWallet) {
      throw new Error('Cannot find wallet');
    }

    this.activeWallet = newActiveWallet;
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
      account.id === user.id ? { ...account, wallets: newUserWallets as unknown as ApiWallet[] } : account
    );

    this.accounts = modifiedAccounts;

    this.setActiveWallet(otherAuthWallet.address);

    this.tierService.calculateAndSetUserTier();
  }

  async getWalletVerifyingSignature({
    address,
    updateSignature = true,
  }: {
    address?: Address;
    updateSignature?: boolean;
    walletClient?: WalletClient;
  }): Promise<WalletSignature> {
    let signature;

    const storedSignature = this.getStoredWalletSignature();

    if (storedSignature) {
      signature = storedSignature;
    } else if (address) {
      let clientToUse = await this.walletClientService.getWalletClient(address);
      let firstAdminWallet;

      if (!clientToUse && this.user && this.activeWallet) {
        const adminWallets = this.user?.wallets.filter(
          (wallet) => wallet.status === WalletStatus.connected && wallet.isAuth
        );

        firstAdminWallet = adminWallets?.length && adminWallets[0].address;

        if (!firstAdminWallet) throw new Error('No client can be found');
        clientToUse = await this.getWalletSigner(firstAdminWallet);
      } else {
        firstAdminWallet = clientToUse?.account?.address;
      }

      if (!clientToUse) throw new Error('No available client');
      const addressToUse = address || firstAdminWallet || undefined;

      if (!addressToUse) {
        throw new Error('Address should be provided');
      }

      // Rabby issue with race condition: https://github.com/RabbyHub/Rabby/issues/2146
      await timeout(100);
      const message = await clientToUse.signMessage({
        message: `Welcome to Balmy! Sign in securely to your Balmy account by authenticating with your primary wallet. This request will not trigger a blockchain transaction or cost any gas fees.\n\nYour authentication will remain active, allowing you to seamlessly access your account and explore the world of decentralized home banking.\n\nBy signing in, you agree to Balmy's Terms of Use (https://app.balmy.xyz/terms_of_use.pdf) and Privacy Policy (https://app.balmy.xyz/privacy_policy.pdf).`,
        account: addressToUse,
      });

      signature = {
        message,
        signer: addressToUse.toLowerCase() as Address,
      };
    } else {
      throw new Error('No signature found');
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

  async fetchAccountBalances() {
    const user = this.getUser();
    if (!user) return;

    const signature = await this.getWalletVerifyingSignature({});

    const accountBalancesResponse = await this.meanApiService.getAccountBalances({
      accountId: user.id,
      chainIds: Object.values(MAIN_NETWORKS).map((network) => network.chainId),
      signature,
    });
    return accountBalancesResponse;
  }

  async invalidateAccountBalances() {
    const user = this.getUser();
    if (!user) return;

    const signature = await this.getWalletVerifyingSignature({});

    await this.meanApiService.invalidateCacheForBalancesOnWallets({
      chains: Object.values(MAIN_NETWORKS).map((network) => network.chainId),
      accountId: user.id,
      signature,
    });
  }

  async invalidateTokenBalances(items: { chain: number; address: string; token: string }[]) {
    const user = this.getUser();
    if (!user) return;

    const signature = await this.getWalletVerifyingSignature({});

    await this.meanApiService.invalidateCacheForBalances({
      items,
      accountId: user.id,
      signature,
    });
  }

  async updateUserConfig(config: SavedCustomConfig) {
    const user = this.getUser();
    if (!user) return;

    const signature = await this.getWalletVerifyingSignature({});

    await this.meanApiService.updateAccountConfig({
      accountId: user.id,
      config,
      signature,
    });
  }

  async claimEarnInviteCode({ inviteCode }: { inviteCode: string }): Promise<{ status: number; message?: string }> {
    const user = this.getUser();
    if (!user) return { status: 500, message: 'User not found' };

    const signature = await this.getWalletVerifyingSignature({});

    try {
      await this.meanApiService.claimEarnInviteCode({ inviteCode, accountId: user.id, signature });
      this.earlyAccessEnabled = true;
      this.web3Service.earnService.hasFetchedUserStrategies = true;

      void this.tierService.pollUser();
      return { status: 200 };
    } catch (error: unknown) {
      const errorResponse = error as { response?: { status: number; data?: { message?: string } } };
      return {
        status: errorResponse.response?.status || 500,
        message: errorResponse.response?.data?.message || 'An unknown error occurred',
      };
    }
  }

  async verifyWalletOwnership(wallet: Address) {
    const user = this.getUser();
    if (!user) return;

    const signature = await this.getWalletVerifyingSignature({});

    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 30);
    const expiration = expirationDate.toString();

    const message = `By signing this message you are authorizing the account (${user.id}) to add this wallet as owner to it. This signature will expire on ${expiration}.`;

    const walletClient = await this.walletClientService.getWalletClient(wallet);
    if (!walletClient || !walletClient.signMessage) {
      throw new Error('No wallet client found');
    }
    const verifyingSignature = await walletClient.signMessage({
      account: wallet,
      message,
    });

    await this.meanApiService.verifyWalletOwnership({
      wallet,
      accountId: user.id,
      signature,
      verifyingSignature,
      expiration,
    });

    this.setWalletOwnership(wallet);
  }

  setWalletOwnership(wallet: Address) {
    const user = this.getUser();
    if (!user) return;

    const updatedWallets = user.wallets.map((userWallet) =>
      userWallet.address === wallet ? { ...userWallet, isOwner: true } : userWallet
    );

    this.user = { ...user, wallets: updatedWallets };

    const accountIndex = findIndex(this.accounts, { id: user.id });

    if (accountIndex !== -1) {
      const accounts = [...this.accounts];
      const updatedAccountWallets = this.accounts[accountIndex].wallets.map((accountWallet) =>
        accountWallet.address === wallet ? { ...accountWallet, isOwner: true } : accountWallet
      );
      accounts[accountIndex].wallets = updatedAccountWallets;
      this.accounts = accounts;
    } else {
      throw new Error('tried to link a wallet to a user that was not set');
    }

    this.tierService.calculateAndSetUserTier();
  }

  async claimEarnEarlyAccess(elegibleAndOwnedAddress: Address) {
    const user = this.getUser();
    if (!user) return;

    const signature = await this.getWalletVerifyingSignature({});

    await this.meanApiService.claimEarnEarlyAccess({
      accountId: user.id,
      signature,
      elegibleAndOwnedAddress,
    });

    this.earlyAccessEnabled = true;
    this.web3Service.earnService.hasFetchedUserStrategies = true;
    void this.tierService.pollUser();
  }

  async getElegibilityAchievements() {
    const user = this.getUser();
    if (!user) {
      throw new Error('User not found');
    }

    const signature = await this.getWalletVerifyingSignature({});
    return this.meanApiService.getElegibilityAchievements({
      signature,
      addresses: user.wallets.map((wallet) => wallet.address),
    });
  }
}
