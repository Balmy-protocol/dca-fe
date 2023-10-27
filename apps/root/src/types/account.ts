import { ConnectedWallet as PrivyConnectedWallet, User as BasePrivyUser } from '@privy-io/react-auth';
import { Provider, Web3Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';
import { IProviderInfo } from '@common/utils/provider-info/types';
import { ContactList } from './contactList';
import { AccountLabels } from './accountLabels';

export enum WalletType {
  embedded = 'embedded',
  external = 'external',
}

export enum WalletStatus {
  connected = 'connected',
  disconnected = 'disconnected',
}

type BaseWallet = {
  type: WalletType;
  // status: WalletStatus;
  address: string;
  label?: string;
};

type UnconnectedWallet = BaseWallet & {
  getProvider(): undefined;
  providerInfo: undefined;
  status: WalletStatus.disconnected;
};

type ConnectedWallet = BaseWallet & {
  getProvider(): Promise<Web3Provider>;
  providerInfo: IProviderInfo;
  status: WalletStatus.connected;
  switchChain(chainId: number): Promise<void>;
};

export type Wallet = UnconnectedWallet | ConnectedWallet;

export enum UserType {
  privy = 'privy',
  wallet = 'wallet',
}

export type BaseUser = {
  id: string; // For privy: `privy:${id}`, for external wallets: `wallet:${address}`
  wallets: Wallet[];
};

export interface PrivyUser extends BaseUser {
  type: UserType.privy;
  privyUser: BasePrivyUser;
}

export interface WalletUser extends BaseUser {
  type: UserType.wallet;
}

export type User = PrivyUser | WalletUser;

export type IAccountService = {
  user?: User;
  activeWallet?: Wallet;
  getUser(): User | undefined;
  setActiveWallet(wallet: string): Promise<void>;
  getActiveWallet(): Wallet | undefined;
  getWalletProvider(wallet: string): Promise<Provider>;
  getWalletSigner(wallet: string): Promise<Signer>;
  setUser(user: BasePrivyUser, wallets: PrivyConnectedWallet[]): void;
};

export interface AccountLabelsAndContactList {
  labels: AccountLabels;
  contacts: ContactList;
}
