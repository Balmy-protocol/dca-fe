import { ConnectedWallet, User as BasePrivyUser } from '@privy-io/react-auth';
import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';

export enum WalletType {
  embedded = 'embedded',
  external = 'external',
}

export type Wallet = {
  type: WalletType;
  address: string;
  label: string;
  getProvider(): Promise<Provider>;
  getSigner?(): Signer;
};

export enum UserType {
  privy = 'privy',
  wallet = 'wallet',
}

export type BaseUser = {
  id: string; // For privy: `privy-${id}`, for external wallets: `wallet-${address}`
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
  setUser(user: BasePrivyUser, wallets: ConnectedWallet[]): void;
};
