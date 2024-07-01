import { Address } from 'viem';
import { NetworkStruct, TokenListId, Token } from '.';
import { Timestamp } from '@balmy/sdk';

export type SdkBaseStrategy = {
  id: StrategyId;
  farm: StrategyFarm;
  guardian?: StrategyGuardian;
  riskLevel: StrategyRiskLevel;
  lastUpdatedAt: Timestamp;
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
  detailed: true;
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

export type Strategy = BaseStrategy | BaseDetailedStrategy;

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

export type GuardianId = string;
export type FarmId = string;
export type StrategyId = string;
