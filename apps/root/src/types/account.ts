import { ConnectedWallet as PrivyConnectedWallet, User as BasePrivyUser } from '@privy-io/react-auth';
import { Provider, Web3Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';
import { IProviderInfo } from '@common/utils/provider-info/types';
import { ContactList } from './contactList';
import { AccountLabels } from './accountLabels';
import { ApiWallet } from './responses';

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
  isAuth: boolean;
};

export type UnconnectedWallet = BaseWallet & {
  getProvider: undefined;
  providerInfo: undefined;
  status: WalletStatus.disconnected;
};

export type ConnectedWallet = BaseWallet & {
  getProvider(): Promise<Web3Provider>;
  providerInfo: IProviderInfo;
  status: WalletStatus.connected;
};

export type Wallet = UnconnectedWallet | ConnectedWallet;

export enum UserStatus {
  loggedIn = 'loggedIn',
  notLogged = 'notLogged',
}
export type WalletSignature = {
  message: string;
  expiration: string;
  signer: string;
};
export type User = {
  wallets: Wallet[];
  id: string;
  status: UserStatus;
  label: string;
  signature?: {
    message: string;
    expiration: string;
    signer: string;
  };
};

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

export type AccountId = string;
export type Account = {
  id: AccountId;
  label: string;
  wallets: ApiWallet[];
  contacts: { wallet: string }[];
  labels: Record<string, string>;
};
