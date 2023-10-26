import { BigNumber } from 'ethers';
import { Token } from './tokens';
import { DCAPermission } from '@mean-finance/sdk';

export enum PositionVersions {
  POSITION_VERSION_1 = '1',
  POSITION_VERSION_2 = '2',
  POSITION_VERSION_3 = '3',
  POSITION_VERSION_4 = '4',
}

export type SwapInterval = {
  id: string;
  interval: BigNumber;
  description: string;
};

export type AvailableSwapInterval = {
  label: {
    singular: string;
    adverb: string;
  };
  value: BigNumber;
};

export interface NFTData {
  description: string;
  image: string;
  name: string;
}

export type PositionStatus = 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
export interface PositionPermission {
  id: string;
  operator: string;
  permissions: DCAPermission[];
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

export type PermissionData = {
  id: string;
  operator: string;
  permissions: DCAPermission[];
};

export type FullPermission = { [key: string]: PermissionData };
export interface Position {
  from: Token;
  to: Token;
  user: string;
  swapInterval: BigNumber; // daily/weekly/etc
  swapped: BigNumber; // total de swappeado
  remainingLiquidity: BigNumber;
  remainingSwaps: BigNumber;
  totalSwaps: BigNumber; // cuanto puse originalmente
  isStale: boolean;
  rate: BigNumber;
  toWithdraw: BigNumber;
  totalExecutedSwaps: BigNumber;
  toWithdrawYield: Nullable<BigNumber>;
  remainingLiquidityYield: Nullable<BigNumber>;
  swappedYield: Nullable<BigNumber>;
  id: string;
  positionId: string;
  status: PositionStatus;
  startedAt: number;
  pendingTransaction: string;
  version: PositionVersions;
  chainId: number;
  pairId: string;
  nextSwapAvailableAt: number;
  permissions?: PermissionData[];
}

export interface SubgraphPosition {
  from: Token;
  to: Token;
  user: string;
  swapInterval: BigNumber; // daily/weekly/etc
  swapped: BigNumber; // total de swappeado
  remainingLiquidity: BigNumber;
  remainingSwaps: BigNumber;
  totalDeposited: BigNumber;
  withdrawn: BigNumber; // cuanto saque
  totalSwaps: BigNumber; // cuanto puse originalmente
  rate: BigNumber;
  toWithdraw: BigNumber;
  totalExecutedSwaps: BigNumber;
  depositedRateUnderlying: Nullable<BigNumber>;
  totalSwappedUnderlyingAccum: Nullable<BigNumber>;
  toWithdrawUnderlyingAccum: Nullable<BigNumber>;
  id: string;
  positionId: string;
  status: string;
  startedAt: number;
  pendingTransaction: string;
  version: PositionVersions;
  chainId: number;
  pairId: string;
  pairLastSwappedAt: number;
  pairNextSwapAvailableAt: string;
  toWithdrawUnderlying: Nullable<BigNumber>;
  remainingLiquidityUnderlying: Nullable<BigNumber>;
  permissions?: PermissionData[];
}

export interface FullPosition {
  from: Token;
  to: Token;
  user: string;
  totalDeposited: string;
  totalSwaps: string; // cuanto puse originalmente
  id: string;
  positionId: string;
  status: PositionStatus;
  startedAt: number;
  totalExecutedSwaps: string;
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
  terminatedAtTimestamp: string;
  chainId: number;
  permissions: PositionPermission[];
  swapInterval: {
    id: string;
    interval: string;
    description: string;
  };
  rate: string;
  remainingSwaps: string;
  swapped: string;
  withdrawn: string;
  remainingLiquidity: string;
  toWithdraw: string;
  depositedRateUnderlying: Nullable<string>;
  totalSwappedUnderlyingAccum: Nullable<string>;
  toWithdrawUnderlyingAccum: Nullable<string>;
  totalWithdrawnUnderlying: Nullable<string>;
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
  swappedUnderlying: string;
  oldRateUnderlying: string;
  withdrawnUnderlying: string;
  withdrawnUnderlyingAccum: string | null;
  rateUnderlying: string;
  depositedRateUnderlying: string;
  withdrawnSwapped: string;
  withdrawnSwappedUnderlying: string;
  withdrawnRemaining: string;
  withdrawnRemainingUnderlying: string;
  pairSwap: {
    ratioUnderlyingAToB: string;
    ratioUnderlyingBToA: string;
    ratioUnderlyingAToBWithFee: string;
    ratioUnderlyingBToAWithFee: string;
  };
  createdAtBlock: string;
  createdAtTimestamp: string;
  transaction: {
    id: string;
    hash: string;
    timestamp: string;
    gasPrice?: string;
    l1GasPrice?: string;
    overhead?: string;
  };
}

export interface PositionKeyBy {
  [key: string]: Position;
}

export type Positions = Position[];
