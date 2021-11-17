import { Token } from './tokens';

export interface AvailablePairSwap {
  executedAtTimestamp: number;
}

export type AvailablePairResponse = {
  tokenA: {
    id: string;
  };
  tokenB: {
    id: string;
  };
  id: string;
  swaps: AvailablePairSwap[];
  createdAtTimestamp: number;
  status: string; // active, stale
};

export interface GetNextSwapInfo {
  swapsToPerform: {
    interval: number;
  }[];
}

export type AvailablePair = {
  token0: Token;
  token1: Token;
  lastExecutedAt: number;
  createdAt: number;
  id: string;
  swapInfo: GetNextSwapInfo;
};

export type AvailablePairs = AvailablePair[];

export interface PairSwapsIntervals {
  id: string;
  swapInterval: {
    id: string;
    interval: string;
    description: string;
  };
  swapPerformed: string;
}
export interface PairSwaps {
  id: string;
  executedAtTimestamp: string;
  executedAtBlock: string;
  ratePerUnitBToAWithFee: string;
  ratePerUnitAToBWithFee: string;
  transaction: {
    id: string;
    hash: string;
    index: string;
    gasSent: string;
    gasPrice: string;
    from: string;
    timestamp: string;
  };
  pairSwapsIntervals: PairSwapsIntervals[];
}

export interface GetPairSwapsData {
  id: string;
  createdAtTimestamp: string;
  tokenA: {
    id: string;
  };
  tokenB: {
    id: string;
  };
  swaps: PairSwaps[];
}
