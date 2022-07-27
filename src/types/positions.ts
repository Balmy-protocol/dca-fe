import { PositionVersions } from 'config';
import { BigNumber } from 'ethers';
import { Token } from './tokens';

export type SwapInterval = {
  id: string;
  interval: BigNumber;
  description: string;
};

export interface NFTData {
  description: string;
  image: string;
  name: string;
}

export type Permission = 'INCREASE' | 'REDUCE' | 'WITHDRAW' | 'TERMINATE';
export interface PositionPermission {
  id: string;
  operator: string;
  permissions: Permission[];
}

export type PositionActions =
  | 'MODIFIED_RATE'
  | 'MODIFIED_DURATION'
  | 'MODIFIED_RATE_AND_DURATION'
  | 'WITHDREW'
  | 'SWAPPED'
  | 'CREATED'
  | 'TERMINATED'
  | 'TRANSFERED'
  | 'PERMISSIONS_MODIFIED';

export interface Position {
  from: Token;
  to: Token;
  user: string;
  swapInterval: BigNumber; // daily/weekly/etc
  swapped: BigNumber; // total de swappeado
  remainingLiquidity: BigNumber;
  remainingSwaps: BigNumber;
  totalDeposits: BigNumber;
  withdrawn: BigNumber; // cuanto saque
  totalSwaps: BigNumber; // cuanto puse originalmente
  rate: BigNumber;
  toWithdraw: BigNumber;
  executedSwaps: BigNumber;
  id: string;
  positionId: string;
  status: string;
  startedAt: number;
  pendingTransaction: string;
  version: PositionVersions;
  chainId: number;
  pairLastSwappedAt: number;
  pairNextSwapAvailableAt: string;
}

export interface FullPosition {
  from: Token;
  to: Token;
  user: string;
  totalDeposits: string;
  totalSwaps: string; // cuanto puse originalmente
  id: string;
  positionId: string;
  status: string;
  startedAt: number;
  executedSwaps: string;
  pendingTransaction: string;
  version: PositionVersions;
  pair: {
    id: string;
    tokenA: Token;
    tokenB: Token;
  };
  createdAtTimestamp: string;
  totalSwapped: string;
  totalWithdrawn: string;
  startedAtSwap: string;
  terminatedAtTimestamp: string;
  chainId: number;
  swapInterval: {
    id: string;
    interval: string;
    description: string;
  };
  current: PositionState;
  history: ActionState[];
}

export interface ActionState {
  id: string;
  action: PositionActions;
  rate: string;
  oldRate: string;
  from: string;
  to: string;
  remainingSwaps: string;
  oldRemainingSwaps: string;
  swapped: string;
  withdrawn: string;
  permissions: PositionPermission[];
  ratePerUnitBToAWithFee: string;
  ratePerUnitAToBWithFee: string;
  createdAtBlock: string;
  createdAtTimestamp: string;
  transaction: {
    id: string;
    hash: string;
    timestamp: string;
  };
}

export interface PositionState {
  id: string;
  startingSwap: string;
  rate: string;
  lastSwap: string;
  remainingSwaps: string;
  swapped: string;
  withdrawn: string;
  remainingLiquidity: string;
  createdAtBlock: string;
  createdAtTimestamp: string;
  idleSwapped: string;
  permissions: PositionPermission[];
  transaction: {
    id: string;
    hash: string;
    timestamp: string;
  };
}

export interface PositionKeyBy {
  [key: string]: Position;
}

export type Positions = Position[];
