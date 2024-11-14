import { NetworkStruct, TokenListId, Token } from '.';
import { AmountsOfToken, Timestamp } from '@balmy/sdk';
import {
  Strategy as SdkBaseStrategy,
  HistoricalData,
  StrategyYieldType,
  StrategyId,
  FarmId,
  GuardianId,
  GuardianFeeType,
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
  SdkBaseStrategy,
  StrategyYieldType,
  HistoricalData,
  StrategyId,
  FarmId,
  GuardianId,
  GuardianFeeType as FeeType,
  SdkHistoricalBalance,
  SdkEarnPositionAction,
  BaseSdkEarnPosition,
  EarnPermission,
  WithdrawType,
  SdkStrategyTokenWithWithdrawTypes,
  SdkStrategyToken,
};

export type SdkBaseDetailedStrategy = SdkBaseStrategy & HistoricalData;

export type SdkStrategy = SdkBaseStrategy | SdkBaseDetailedStrategy;

export type StrategyFarm = SdkStrategy['farm'];

export type StrategyGuardian = Required<Pick<SdkStrategy, 'guardian'>>['guardian'];

export type FeeTypeType = StrategyGuardian['fees'][number]['type'];

export type ApiGuardianFee = StrategyGuardian['fees'][number];

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

export type SdkEarnPositionId = SdkEarnPosition['id'];

export type DetailedSdkEarnPosition = DistributiveOmit<BaseSdkEarnPosition, 'history'> & {
  history: SdkEarnPositionAction[];
};

export type SdkEarnPosition = BaseSdkEarnPosition | DetailedSdkEarnPosition;

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
export type TokenWithWitdrawTypes = Token & { withdrawTypes: WithdrawType[] };

export type BaseStrategy = DistributiveOmit<SavedBaseSdkStrategy, 'rewards' | 'asset'> & {
  asset: TokenWithWitdrawTypes;
  rewards: { tokens: TokenWithWitdrawTypes[]; apy: number };
  network: NetworkStruct;
  formattedYieldType: string;
  lastUpdatedAt: Timestamp;
  userPositions?: SdkEarnPositionId[];
};

export type BaseDetailedStrategy = BaseStrategy & HistoricalData & { detailed: true };

export type SavedBaseSdkStrategy = SdkBaseStrategy & { lastUpdatedAt: number; userPositions?: SdkEarnPositionId[] };
export type SavedBaseDetailedSdkStrategy = SdkBaseDetailedStrategy & {
  detailed: true;
  lastUpdatedAt: number;
  userPositions?: SdkEarnPositionId[];
};
export type SavedSdkStrategy = SavedBaseSdkStrategy | SavedBaseDetailedSdkStrategy;
export type Strategy = BaseStrategy | BaseDetailedStrategy;
export type DisplayStrategy = DistributiveOmit<Strategy, 'userPositions'> & { userPositions?: EarnPosition[] };

export type SavedBaseSdkEarnPosition = DistributiveOmit<BaseSdkEarnPosition, 'historicalBalances'> & {
  historicalBalances: SdkHistoricalBalance[];
  lastUpdatedAt: number;
  pendingTransaction?: string;
};
export type SavedBaseDetailedSdkEarnPosition = DistributiveOmit<SavedBaseSdkEarnPosition, 'history'> & {
  detailed: true;
  lastUpdatedAt: number;
  pendingTransaction?: string;
  history: SdkEarnPositionAction[];
};
export type BaseSavedSdkEarnPosition = SavedBaseSdkEarnPosition | SavedBaseDetailedSdkEarnPosition;
export type SavedSdkEarnPosition = DistributiveOmit<BaseSavedSdkEarnPosition, 'strategy'> & {
  strategy: StrategyId;
};

type HistoricalBalance = {
  timestamp: Timestamp;
  balances: { token: Token; amount: AmountsOfToken; profit: AmountsOfToken }[];
};

export type BaseEarnPosition = DistributiveOmit<
  SavedSdkEarnPosition,
  'balances' | 'historicalBalances' | 'strategy' | 'detailed' | 'history' | 'delayed'
> & {
  balances: { token: Token; amount: AmountsOfToken; profit: AmountsOfToken }[];
  delayed?: { token: Token; pending: AmountsOfToken; ready: AmountsOfToken }[];
  historicalBalances: HistoricalBalance[];
  strategy: Strategy;
  lastUpdatedAt: Timestamp;
  history?: EarnPositionAction[];
};

export type DetailedEarnPosition = DistributiveOmit<BaseEarnPosition, 'history'> & {
  history: EarnPositionAction[];
  detailed: true;
};

export type EarnPosition = BaseEarnPosition | DetailedEarnPosition;

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
