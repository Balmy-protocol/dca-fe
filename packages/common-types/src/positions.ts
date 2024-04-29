import { Address } from 'viem';
import { Token } from './tokens';
import { AmountsOfToken, YieldOption } from '.';
import {
  CreatedAction,
  DCAPermission,
  DCAPositionAction,
  ModifiedAction,
  PermissionsModifiedAction,
  SwappedAction,
  TerminatedAction,
  TransferredAction,
  WithdrawnAction,
} from '@mean-finance/sdk';

export enum PositionVersions {
  POSITION_VERSION_1 = '1',
  POSITION_VERSION_2 = '2',
  POSITION_VERSION_3 = '3',
  POSITION_VERSION_4 = '4',
}

export type SwapInterval = {
  id: string;
  interval: bigint;
  description: string;
};

export type AvailableSwapInterval = {
  label: {
    singular: string;
    adverb: string;
  };
  value: bigint;
};

export interface NFTData {
  description: string;
  image: string;
  name: string;
}

export type DCAPositionSwappedAction = DCAPositionAction & SwappedAction;
export type DCAPositionCreatedAction = DCAPositionAction & CreatedAction;
export type DCAPositionModifiedAction = DCAPositionAction & ModifiedAction;
export type DCAPositionPermissionsModifiedAction = DCAPositionAction & PermissionsModifiedAction;
export type DCAPositionTerminatedAction = DCAPositionAction & TerminatedAction;
export type DCAPositionWithdrawnAction = DCAPositionAction & WithdrawnAction;
export type DCAPositionTransferredAction = DCAPositionAction & TransferredAction;

export type PositionStatus = 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
export interface PositionPermission {
  id: string;
  operator: Address;
  permissions: DCAPermission[];
}

export type PermissionData = {
  id: string;
  operator: string;
  permissions: DCAPermission[];
};

export type FullPermission = { [key: string]: PermissionData };
export interface Position {
  from: Token;
  to: Token;
  user: Address;
  swapInterval: bigint; // daily/weekly/etc
  swapped: AmountsOfToken; // total de swappeado
  remainingLiquidity: AmountsOfToken;
  remainingSwaps: bigint;
  totalSwaps: bigint; // cuanto puse originalmente
  isStale: boolean;
  rate: AmountsOfToken;
  toWithdraw: AmountsOfToken;
  totalExecutedSwaps: bigint;
  toWithdrawYield?: AmountsOfToken;
  remainingLiquidityYield?: AmountsOfToken;
  swappedYield?: AmountsOfToken;
  id: string;
  positionId: bigint;
  status: PositionStatus;
  startedAt: number;
  pendingTransaction: string;
  version: PositionVersions;
  chainId: number;
  pairId: string;
  nextSwapAvailableAt: number;
  permissions?: PermissionData[];
  yields: {
    from?: PositionYieldOption;
    to?: PositionYieldOption;
  };
  history?: DCAPositionAction[];
}

export interface PositionWithHistory extends Position {
  history: DCAPositionAction[];
}

export interface PositionKeyBy {
  [key: string]: Position;
}

export type Positions = Position[];

export type PositionYieldOption = Pick<YieldOption, 'apy' | 'name' | 'token' | 'tokenAddress'>;
