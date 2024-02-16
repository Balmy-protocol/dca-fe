import { Address } from '.';

export interface SwapsToPerform {
  interval: number;
}
export interface GetNextSwapInfo {
  swapsToPerform: SwapsToPerform[];
}

export type SwapInfo = [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];
export type LastSwappedAt = [number, number, number, number, number, number, number, number];
export type NextSwapAvailableAt = number;
export type AvailablePair = {
  token0: Address;
  token1: Address;
  id: string;
  nextSwapAvailableAt: Record<number, NextSwapAvailableAt>;
  isStale: Record<number, boolean>;
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
  pairSwap: {
    ratioUnderlyingAToB: string;
    ratioUnderlyingBToA: string;
    ratioUnderlyingAToBWithFee: string;
    ratioUnderlyingBToAWithFee: string;
  };
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
    address: string;
  };
  tokenB: {
    address: string;
  };
  swaps: PairSwaps[];
  activePositionsPerInterval: [number, number, number, number, number, number, number, number];
  lastSwappedAt: LastSwappedAt;
}
