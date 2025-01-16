import { NetworkStruct, TokenListId, Token, AccountId, Achievement, Address } from '.';
import { AmountsOfToken, Timestamp } from '@balmy/sdk';
import {
  Strategy as SdkBaseStrategy,
  HistoricalData,
  StrategyYieldType,
  StrategyId,
  FarmId,
  GuardianId,
  FeeType,
  EarnPosition as BaseSdkEarnPosition,
  HistoricalBalance as SdkHistoricalBalance,
  EarnPositionAction as SdkEarnPositionAction,
  WithdrawnAction as SdkWithdrewAction,
  WithdrawnSpeciallyAction as SdkWithdrawnSpeciallyAction,
  DelayedWithdrawalClaimedAction as SdkDelayedWithdrawalClaimedAction,
  CreatedAction,
  IncreasedAction,
  TransferredAction,
  PermissionsModifiedAction,
  Transaction as EarnActionTransaction,
  EarnPermission,
  WithdrawType,
  TokenWithWithdrawTypes as SdkStrategyTokenWithWithdrawTypes,
  Token as SdkStrategyToken,
} from '@balmy/sdk/dist/services/earn/types';

export {
  StrategyYieldType,
  HistoricalData,
  StrategyId,
  FarmId,
  GuardianId,
  FeeType,
  SdkHistoricalBalance,
  SdkEarnPositionAction,
  BaseSdkEarnPosition,
  EarnPermission,
  WithdrawType,
  SdkStrategyTokenWithWithdrawTypes,
  SdkStrategyToken,
};

export type SdkStrategy = SdkBaseStrategy & Partial<HistoricalData>;

export type StrategyFarm = SdkStrategy['farm'];

export type StrategyGuardian = Required<Pick<SdkStrategy, 'guardian'>>['guardian'];

export type FeeTypeType = StrategyGuardian['fees'][number]['type'];

export type ApiGuardianFee = StrategyGuardian['fees'][number];

export type SummarizedSdkStrategyParameters = {
  protocols: string[];
  guardians: Record<GuardianId, StrategyGuardian>;
  tokens: {
    assets: Record<TokenListId, SdkStrategyToken>;
    rewards: Record<TokenListId, SdkStrategyToken>;
  };
  networks: Record<number, NetworkStruct>;
  yieldTypes: StrategyYieldType[];
};

export type SdkEarnPositionId = SdkEarnPosition['id'];

export type SdkEarnPosition = BaseSdkEarnPosition;

export enum EarnPositionActionType {
  CREATED = 'created',
  INCREASED = 'increased',
  WITHDREW = 'withdrawn',
  SPECIAL_WITHDREW = 'withdrawn specially',
  TRANSFERRED = 'transferred',
  PERMISSIONS_MODIFIED = 'modified permissions',
  DELAYED_WITHDRAWAL_CLAIMED = 'delayed withdrawal claimed',
}

// ---- FE Types -----
export type TokenWithWitdrawTypes = Token & { withdrawTypes: WithdrawType[]; apy?: number };

export type SavedSdkStrategy = SdkStrategy & {
  lastUpdatedAt: number;
  userPositions?: SdkEarnPositionId[];
  hasFetchedHistoricalData: boolean;
};

export type Strategy = DistributiveOmit<SavedSdkStrategy, 'rewards' | 'asset'> & {
  asset: TokenWithWitdrawTypes;
  rewards: { tokens: TokenWithWitdrawTypes[]; apy: number };
  network: NetworkStruct;
  formattedYieldType: string;
  lastUpdatedAt: Timestamp;
  userPositions?: SdkEarnPositionId[];
  hasFetchedHistoricalData: boolean;
  // This will filter all tokens with apy 0
  displayRewards: { tokens: TokenWithWitdrawTypes[]; apy: number };
};

export type DisplayStrategy = DistributiveOmit<Strategy, 'userPositions'> & { userPositions?: EarnPosition[] };

export type BaseSavedSdkEarnPosition = DistributiveOmit<BaseSdkEarnPosition, 'historicalBalances'> & {
  historicalBalances: SdkHistoricalBalance[];
  lastUpdatedAt: Timestamp;
  lastUpdatedAtFromApi: Timestamp;
  pendingTransaction?: string;
  hasFetchedHistory: boolean;
  history: SdkEarnPositionAction[];
};

export type SavedSdkEarnPosition = DistributiveOmit<BaseSavedSdkEarnPosition, 'strategy'> & {
  strategy: StrategyId;
};

type HistoricalBalance = {
  timestamp: Timestamp;
  balances: { token: Token; amount: AmountsOfToken; profit: AmountsOfToken }[];
};

export type EarnPosition = DistributiveOmit<
  SavedSdkEarnPosition,
  'balances' | 'historicalBalances' | 'strategy' | 'history' | 'delayed'
> & {
  balances: { token: Token; amount: AmountsOfToken; profit: AmountsOfToken }[];
  delayed?: { token: Token; pending: AmountsOfToken; ready: AmountsOfToken }[];
  historicalBalances: HistoricalBalance[];
  strategy: Strategy;
  lastUpdatedAt: Timestamp;
  history: EarnPositionAction[];
  hasFetchedHistory: boolean;
};

type WithdrewAction = DistributiveOmit<SdkWithdrewAction, 'withdrawn'> & {
  withdrawn: {
    token: Token;
    amount: AmountsOfToken;
    withdrawType: WithdrawType;
  }[];
};

type SpecialWithdrewAction = DistributiveOmit<SdkWithdrawnSpeciallyAction, 'withdrawn'> & {
  withdrawn: {
    token: Token;
    amount: AmountsOfToken;
  }[];
};

type DelayedWithdrawalClaimedAction = DistributiveOmit<SdkDelayedWithdrawalClaimedAction, 'token'> & {
  token: Token;
};

export type EarnPositionCreatedAction = CreatedAction & { tx: EarnActionTransaction };
export type EarnPositionIncreasedAction = IncreasedAction & { tx: EarnActionTransaction };
export type EarnPositionWithdrewAction = WithdrewAction & { tx: EarnActionTransaction };
export type EarnPositionSpecialWithdrewAction = SpecialWithdrewAction & { tx: EarnActionTransaction };
export type EarnPositionDelayedWithdrawalClaimedAction = DelayedWithdrawalClaimedAction & { tx: EarnActionTransaction };
export type EarnPositionTransferredAction = TransferredAction & { tx: EarnActionTransaction };
export type EarnPositionPermissionsModifiedAction = PermissionsModifiedAction & { tx: EarnActionTransaction };

export type EarnPositionAction =
  | EarnPositionCreatedAction
  | EarnPositionIncreasedAction
  | EarnPositionWithdrewAction
  | EarnPositionSpecialWithdrewAction
  | EarnPositionDelayedWithdrawalClaimedAction
  | EarnPositionTransferredAction
  | EarnPositionPermissionsModifiedAction;

export type DelayedWithdrawalPositions = EarnPosition & {
  delayed: NonNullable<EarnPosition['delayed']>;
  totalPendingUsd: number;
  totalReadyUsd: number;
};
export enum DelayedWithdrawalStatus {
  PENDING = 'pending',
  READY = 'ready',
}
export type EarnInviteCode = { code: string; claimedBy?: AccountId };

export type EarnEarlyAccess = {
  earlyAccess: boolean;
  inviteCodes: EarnInviteCode[];
  referrals: AccountId[];
  twitterShare: boolean;
  achievements: Record<Address, Achievement[]>;
};

export enum StrategyConditionType {
  PROMOTED = 'PROMOTED',
  LOCKED = 'LOCKED',
}
