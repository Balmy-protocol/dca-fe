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
