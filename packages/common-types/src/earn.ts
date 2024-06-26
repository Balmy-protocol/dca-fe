import { Address } from 'viem';
import { NetworkStruct, TokenListId, Token } from '.';

export type SdkStrategy = {
  id: string;
  farm: StrategyFarm;
  guardian?: StrategyGuardian;
  riskLevel: StrategyRiskLevel;
};

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

type ApiGuardianFee = {
  type: 'deposit' | 'withdraw' | 'performance' | 'save';
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

export type Strategy = {
  id: string;
  asset: Token;
  rewards: { tokens: Token[]; apy: number };
  network: NetworkStruct;
  formattedYieldType: string;
  farm: StrategyFarm;
  riskLevel: StrategyRiskLevel;
  guardian?: StrategyGuardian;
};

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
