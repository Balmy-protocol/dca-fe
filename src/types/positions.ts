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

export interface Position {
  from: Token;
  to: Token;
  swapInterval: BigNumber; // daily/weekly/etc
  swapped: BigNumber; // total de swappeado
  remainingLiquidity: BigNumber;
  remainingSwaps: BigNumber;
  totalDeposits: BigNumber;
  withdrawn: BigNumber; // cuanto saque
  totalSwaps: BigNumber; // cuanto puse originalmente
  rate: BigNumber;
  id: string;
  status: string;
  startedAt: number;
  pendingTransaction: string;
  pairId: string;
}

export interface FullPosition {
  from: Token;
  to: Token;
  totalDeposits: string;
  totalSwaps: string; // cuanto puse originalmente
  id: string;
  status: string;
  startedAt: number;
  pendingTransaction: string;
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
  swapInterval: {
    id: string;
    interval: string;
    description: string;
  };
  current: PositionState;
  history: PositionState[];
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
