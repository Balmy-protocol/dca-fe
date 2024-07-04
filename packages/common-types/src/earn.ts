import { Address } from 'viem';
import { NetworkStruct, TokenListId, Token } from '.';
import { AmountsOfToken, ChainId, PositionId, Timestamp } from '@balmy/sdk';

// ---- SDK Types -----
export type SdkBaseStrategy = {
  id: StrategyId;
  farm: StrategyFarm;
  guardian?: StrategyGuardian;
  riskLevel: StrategyRiskLevel;
};

export type SdkBaseDetailedStrategy = SdkBaseStrategy & {
  historicalAPY: {
    timestamp: Timestamp;
    apy: number;
  }[];
  historicalTVL: {
    timestamp: Timestamp;
    tvl: number;
  }[];
};

export type SdkStrategy = SdkBaseStrategy | SdkBaseDetailedStrategy;

export type StrategyFarm = {
  id: FarmId;
  name: string;
  chainId: number;
  asset: SdkStrategyToken;
  rewards?: { tokens: SdkStrategyToken[]; apy: number };
  tvl: number;
  type: StrategyYieldType;
  apy: number;
};

export type StrategyGuardian = {
  id: GuardianId;
  name: string;
  description: string;
  logo: string;
  fees: ApiGuardianFee[];
};

export enum FeeType {
  deposit = 'deposit',
  withdraw = 'withdraw',
  performance = 'performance',
  save = 'save',
}

export type ApiGuardianFee = {
  type: FeeType;
  percentage: number;
};

export type SdkStrategyToken = {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  price?: number;
};

export enum StrategyYieldType {
  LENDING,
  STAKING,
}

export enum StrategyRiskLevel {
  LOW,
  MEDIUM,
  HIGH,
}

export type SummarizedSdkStrategyParameters = {
  farms: Record<FarmId, StrategyFarm>;
  guardians: Record<GuardianId, StrategyGuardian>;
  tokens: {
    assets: Record<TokenListId, SdkStrategyToken>;
    rewards: Record<TokenListId, SdkStrategyToken>;
  };
  networks: Record<number, NetworkStruct>;
  yieldTypes: StrategyYieldType[];
};

export type BaseSdkEarnPosition = {
  id: SdkEarnPositionId;
  createdAt: Timestamp;
  owner: Address;
  permissions: EarnPermissions;
  strategy: SdkBaseStrategy;
  balances: { token: SdkStrategyToken; amount: AmountsOfToken; profit: AmountsOfToken }[];
  historicalBalances: SdkHistoricalBalance[];
};

export type DetailedSdkEarnPosition = BaseSdkEarnPosition & {
  history: SdkEarnPositionAction[];
};

export type SdkEarnPosition = BaseSdkEarnPosition | DetailedSdkEarnPosition;

type SdkHistoricalBalance = {
  timestamp: Timestamp;
  balances: { token: SdkStrategyToken; amount: AmountsOfToken; profit: AmountsOfToken }[];
};

export type GuardianId = string;
export type FarmId = string;
export type StrategyId = string;

type SdkActionType =
  | CreatedAction
  | IncreasedAction
  | SdkWithdrewAction
  | TransferredAction
  | PermissionsModifiedAction;

type CreatedAction = {
  action: 'created';
  owner: Address;
  permissions: EarnPermissions;
  deposited: AmountsOfToken;
};

type IncreasedAction = {
  action: 'increased';
  deposited: AmountsOfToken;
};

type SdkWithdrewAction = {
  action: 'withdrew';
  withdrawn: {
    token: SdkStrategyToken;
    amount: AmountsOfToken;
  }[];
  recipient: Address;
};

type TransferredAction = {
  action: 'transferred';
  from: Address;
  to: Address;
};

type PermissionsModifiedAction = {
  action: 'modified permissions';
  permissions: EarnPermissions;
};

export type SdkEarnPositionId = `${ChainId}-${VaultAddress}-${TokenId}`;
type VaultAddress = Address;
type TokenId = bigint;

type SdkEarnPositionAction = { tx: EarnActionTransaction } & SdkActionType;

export type EarnActionTransaction = {
  hash: string;
  timestamp: Timestamp;
};
type Permission = 'WITHDRAW' | 'INCREASE';

type EarnPermissions = Record<Address, Permission[]>;

// ---- FE Types -----
export type BaseStrategy = {
  id: StrategyId;
  asset: Token;
  rewards: { tokens: Token[]; apy: number };
  network: NetworkStruct;
  formattedYieldType: string;
  farm: StrategyFarm;
  riskLevel: StrategyRiskLevel;
  guardian?: StrategyGuardian;
  lastUpdatedAt: Timestamp;
};

export type BaseDetailedStrategy = BaseStrategy & {
  historicalAPY: {
    timestamp: Timestamp;
    apy: number;
  }[];
  historicalTVL: {
    timestamp: Timestamp;
    tvl: number;
  }[];
  detailed: true;
};

export type SavedBaseSdkStrategy = SdkBaseStrategy & { lastUpdatedAt: number; userPositions?: PositionId[] };
export type SavedBaseDetailedSdkStrategy = SdkBaseDetailedStrategy & {
  detailed: true;
  lastUpdatedAt: number;
  userPositions?: PositionId[];
};
export type SavedSdkStrategy = SavedBaseSdkStrategy | SavedBaseDetailedSdkStrategy;
export type Strategy = BaseStrategy | BaseDetailedStrategy;

export type SavedBaseSdkEarnPosition = BaseSdkEarnPosition & { lastUpdatedAt: number };
export type SavedBaseDetailedSdkEarnPosition = DetailedEarnPosition & { detailed: true; lastUpdatedAt: number };
export type BaseSavedSdkEarnPosition = SavedBaseSdkEarnPosition | SavedBaseDetailedSdkEarnPosition;
export type SavedSdkEarnPosition = Omit<BaseSavedSdkEarnPosition, 'strategy'> & {
  strategy: StrategyId;
};

export type BaseEarnPosition = {
  id: SdkEarnPositionId;
  createdAt: Timestamp;
  owner: Address;
  permissions: EarnPermissions;
  strategy: Strategy;
  balances: { token: Token; amount: AmountsOfToken; profit: AmountsOfToken }[];
  historicalBalances: HistoricalBalance[];
  lastUpdatedAt: Timestamp;
};

export type DetailedEarnPosition = BaseEarnPosition & {
  history?: EarnPositionAction[];
  detailed: true;
};

export type EarnPosition = BaseEarnPosition | DetailedEarnPosition;

type HistoricalBalance = {
  timestamp: Timestamp;
  balances: { token: Token; amount: AmountsOfToken; profit: AmountsOfToken }[];
};

type WithdrewAction = {
  action: 'withdrew';
  withdrawn: {
    token: Token;
    amount: AmountsOfToken;
  }[];
  recipient: Address;
};

type ActionType = CreatedAction | IncreasedAction | WithdrewAction | TransferredAction | PermissionsModifiedAction;

type EarnPositionAction = { tx: EarnActionTransaction } & ActionType;
