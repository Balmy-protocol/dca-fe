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
  links?: {
    website?: string;
    twitter?: string;
    discord?: string;
  };
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

export enum EarnPositionActionType {
  CREATED = 'created',
  INCREASED = 'increased',
  WITHDREW = 'withdrew',
  TRANSFERRED = 'transferred',
  PERMISSIONS_MODIFIED = 'modified permissions',
}

type CreatedAction = {
  action: EarnPositionActionType.CREATED;
  owner: Address;
  permissions: EarnPermissions;
  deposited: AmountsOfToken;
  assetPrice?: number;
  timestamp: Timestamp;
};

type IncreasedAction = {
  action: EarnPositionActionType.INCREASED;
  deposited: AmountsOfToken;
  assetPrice?: number;
  timestamp: Timestamp;
};

type SdkWithdrewAction = {
  action: EarnPositionActionType.WITHDREW;
  withdrawn: {
    token: SdkStrategyToken;
    amount: AmountsOfToken;
  }[];
  recipient: Address;
  timestamp: Timestamp;
};

type TransferredAction = {
  action: EarnPositionActionType.TRANSFERRED;
  from: Address;
  to: Address;
  timestamp: Timestamp;
};

type PermissionsModifiedAction = {
  action: EarnPositionActionType.PERMISSIONS_MODIFIED;
  permissions: EarnPermissions;
  timestamp: Timestamp;
};

export type SdkEarnPositionId = `${ChainId}-${VaultAddress}-${TokenId}`;
type VaultAddress = Address;
type TokenId = bigint;

type SdkEarnPositionAction = { tx: EarnActionTransaction } & SdkActionType;

export type EarnActionTransaction = {
  hash: string;
  timestamp: Timestamp;
};
export enum EarnPermission {
  INCREASE = 'INCREASE',
  WITHDRAW = 'WITHDRAW',
}

type EarnPermissions = Record<Address, EarnPermission[]>;

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
  userPositions?: PositionId[];
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
export type DisplayStrategy = DistributiveOmit<Strategy, 'userPositions'> & { userPositions?: EarnPosition[] };

export type SavedBaseSdkEarnPosition = BaseSdkEarnPosition & { lastUpdatedAt: number; pendingTransaction?: string };
export type SavedBaseDetailedSdkEarnPosition = DetailedSdkEarnPosition & {
  detailed: true;
  lastUpdatedAt: number;
  pendingTransaction?: string;
};
export type BaseSavedSdkEarnPosition = SavedBaseSdkEarnPosition | SavedBaseDetailedSdkEarnPosition;
export type SavedSdkEarnPosition = DistributiveOmit<BaseSavedSdkEarnPosition, 'strategy'> & {
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
  action: EarnPositionActionType.WITHDREW;
  withdrawn: {
    token: Token;
    amount: AmountsOfToken;
  }[];
  recipient: Address;
  timestamp: Timestamp;
};

type ActionType = CreatedAction | IncreasedAction | WithdrewAction | TransferredAction | PermissionsModifiedAction;

export type EarnPositionAction = { tx: EarnActionTransaction } & ActionType;

export type EarnPositionCreatedAction = CreatedAction & { tx: EarnActionTransaction };
export type EarnPositionIncreasedAction = IncreasedAction & { tx: EarnActionTransaction };
export type EarnPositionWithdrewAction = WithdrewAction & { tx: EarnActionTransaction };
export type EarnPositionTransferredAction = TransferredAction & { tx: EarnActionTransaction };
export type EarnPositionPermissionsModifiedAction = PermissionsModifiedAction & { tx: EarnActionTransaction };
