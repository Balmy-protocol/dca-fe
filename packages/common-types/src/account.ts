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

// Mapping of achievement IDs to specific requirements
export enum AchievementKeys {
  SWAP_VOLUME = 'agg-swaps',
  TWEET = 'earn-early-access-twitter-share',
  MIGRATED_VOLUME = 'migrations',
  REFERRALS = 'referrals',
}

export type ApiAchievement = {
  id: AchievementKeys;
  achieved: boolean | number;
};

export type Achievement = {
  id: AchievementKeys;
  achieved: number;
};

export type AccountId = string;
export type Account = {
  id: AccountId;
  label: string;
  wallets: ApiWallet[];
  contacts: { wallet: string }[];
  labels: Record<string, string>;
};

export type AccountResponse = Account & {
  referrals: {
    id: string;
    activated: number;
    referred: number;
  };
  achievements: {
    wallets: Record<Address, Achievement[]>;
    account: Achievement[];
  };
};
