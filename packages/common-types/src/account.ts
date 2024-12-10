import { ContactList } from './contactList';
import { AccountLabels } from './accountLabels';
import { ApiWallet } from './responses';
import { Address } from 'viem';

export enum WalletType {
  embedded = 'embedded',
  external = 'external',
}

export enum WalletStatus {
  connected = 'connected',
  disconnected = 'disconnected',
}

export type Wallet = {
  type: WalletType;
  status: WalletStatus;
  address: Address;
  label?: string;
  isAuth: boolean;
  ens?: string | null;
  isOwner: boolean;
  achievements: Achievement[];
};

export enum UserStatus {
  loggedIn = 'loggedIn',
  notLogged = 'notLogged',
}
export type WalletSignature = {
  message: string;
  signer: Address;
};
export type User = {
  wallets: Wallet[];
  id: string;
  status: UserStatus;
  label: string;
  signature?: WalletSignature;
};

export interface AccountLabelsAndContactList {
  labels: AccountLabels;
  contacts: ContactList;
}

export type Achievement = {
  id: string;
  achieved: string | number;
};

export type AccountId = string;
export type Account = {
  id: AccountId;
  label: string;
  wallets: ApiWallet[];
  contacts: { wallet: string }[];
  labels: Record<string, string>;
};
