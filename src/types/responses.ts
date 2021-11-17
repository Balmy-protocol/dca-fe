import { BigNumber } from 'ethers';
import { Token } from './tokens';

export interface PoolLiquidityData {
  id: string;
  poolDayData: {
    id: string;
    volumeUSD: string;
  }[];
}

export type PoolsLiquidityData = PoolLiquidityData[];

export interface GetPairResponseSwapData {
  id: string;
  executedAtTimestamp: string;
  ratePerUnitAToB: string;
  ratePerUnitBToA: string;
}

export interface GetPairPriceResponseData {
  pair: {
    id: string;
    swaps: GetPairResponseSwapData[];
  };
}

export type PositionResponse = {
  id: string;
  dcaId: string;
  from: Token;
  to: Token;
  pair: {
    id: string;
  };
  status: string;
  swapInterval: {
    id: string;
    interval: BigNumber;
    description: BigNumber;
  };
  current: {
    id: string;
    rate: BigNumber;
    remainingSwaps: BigNumber;
    swapped: BigNumber;
    withdrawn: BigNumber;
    remainingLiquidity: BigNumber;
  };
  rate: BigNumber;
  totalDeposits: BigNumber;
  totalSwaps: BigNumber;
  totalSwapped: BigNumber;
  totalWithdrawn: BigNumber;
  createdAtTimestamp: number;
};

export interface TxPriceResponse {
  unit: string;
  blockPrices: {
    estimatedPrices: {
      price: number;
      maxPriorityFeePerGas: number;
      maxFeePerGas: number;
    }[];
  }[];
}
export interface CoinGeckoTokenPriceResponse {
  id: string;
  current_price: number;
}

export type CoinGeckoPriceResponse = CoinGeckoTokenPriceResponse[];

export interface UsedTokenInfo {
  address: string;
}

export interface UsedToken {
  tokenInfo: UsedTokenInfo;
}

export interface GetUsedTokensData {
  tokens: UsedToken[];
}

export interface GetUsedTokensDataResponse {
  data: GetUsedTokensData;
}

export type GetAllowanceResponse = {
  allowance: string;
  token: Token;
};

export interface EstimatedPairResponse {
  gas: string;
  gasUsd: number;
  gasEth: BigNumber;
}

export type GetPoolResponse = {
  pools: {
    id: string;
  }[];
};

export type PoolResponse = {
  token0: {
    decimals: string;
    id: string;
    name: string;
    symbol: string;
    totalValueLockedUSD: string;
    chainId: number;
  };
  token1: {
    decimals: string;
    id: string;
    name: string;
    symbol: string;
    totalValueLockedUSD: string;
    chainId: number;
  };
  id: string;
};
