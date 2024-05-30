import { Address } from 'viem';
import { NetworkStruct, TokenWithIcon } from '.';

export type ApiStrategy = {
  id: string;
  chainId: number;
  asset: ApiEarnToken;
  rewards: Record<Address, { token: ApiEarnToken; apy: number }>;
  farm: ApiFarm;
  guardian?: ApiGuardian;
  // riskLevel?, // TBD
};

type ApiFarm = {
  id: string;
  name: string;
  tvl: number;
  yieldType: StrategyYieldType;
};

type ApiGuardian = {
  name: string;
  description: string;
  fees: ApiGuardianFee[];
};

type ApiGuardianFee = {
  type: 'deposit' | 'withdraw' | 'performance' | 'save';
  percentage: number;
};

export type ApiEarnToken = {
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

export type Strategy = {
  id: string;
  asset: TokenWithIcon;
  rewards: { token: TokenWithIcon; apy: number }[];
  network: NetworkStruct;
  formattedYieldType: string;
  farm: ApiFarm;
  guardian?: ApiGuardian;
};
