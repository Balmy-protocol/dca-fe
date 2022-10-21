import { Log } from '@ethersproject/providers';
import { PositionVersions } from 'config';
import { Oracles } from './contracts';
import { Position } from './positions';
import { Token } from './tokens';

export interface TransactionReceipt {
  to: string;
  from: string;
  contractAddress: string;
  transactionIndex: number;
  root?: string;
  logsBloom: string;
  blockHash: string;
  transactionHash: string;
  logs: Array<Log>;
  blockNumber: number;
  confirmations: number;
  byzantium: boolean;
  type: number;
  status?: number;
  chainId: number;
}

export type TransactionTypes =
  | 'NEW_POSITION'
  | 'NEW_PAIR'
  | 'APPROVE_TOKEN'
  | 'WRAP_ETHER'
  | 'TERMINATE_POSITION'
  | 'WITHDRAW_POSITION'
  | 'ADD_FUNDS_POSITION'
  | 'NO_OP'
  | 'REMOVE_FUNDS'
  | 'MODIFY_SWAPS_POSITION'
  | 'MODIFY_RATE_AND_SWAPS_POSITION'
  | 'TRANSFER_POSITION'
  | 'APPROVE_COMPANION'
  | 'MODIFY_PERMISSIONS'
  | 'MIGRATE_POSITION'
  | 'MIGRATE_POSITION_YIELD'
  | 'WITHDRAW_FUNDS'
  | 'RESET_POSITION';

export type TransactionTypesConstant = Record<TransactionTypes, TransactionTypes>;

export interface WithdrawTypeData {
  id: number | string;
}

export interface WithdrawFundsTypeData {
  id: number | string;
  from: string;
  removedFunds: string;
}

export interface TransferTypeData {
  id: number | string;
  from: string;
  to: string;
  toAddress: string;
}

export interface ModifyPermissionsTypeData {
  id: number | string;
  from: string;
  to: string;
}
export interface MigratePositionTypeData {
  id: number | string;
  from: string;
  to: string;
  newId?: string;
}

export interface MigratePositionYieldTypeData {
  id: number | string;
  from: string;
  to: string;
  fromYield?: string;
  toYield?: string;
  newId?: string;
}

export interface ApproveCompanionTypeData {
  id: number | string;
  from: string;
  to: string;
}

export interface AddFundsTypeData {
  id: number | string;
  newFunds: string;
  decimals: number;
}

export interface ResetPositionTypeData {
  id: number | string;
  newFunds: string;
  newSwaps: string;
  decimals: number;
}

export interface RemoveFundsTypeData {
  id: number | string;
  ammountToRemove: string;
  decimals: number;
}
export interface ModifySwapsPositionTypeData {
  id: number | string;
  newSwaps: string;
}

export interface ModifyRateAndSwapsPositionTypeData {
  id: number | string;
  newRate: string;
  decimals: number;
  newSwaps: string;
}
export interface TerminatePositionTypeData {
  id: number | string;
}

export interface ApproveTokenTypeData {
  token: Token;
  addressFor: string;
}

export interface WrapEtherTypeData {
  amount: string;
}

export interface NewPositionTypeData {
  from: Token;
  to: Token;
  fromYield?: string;
  toYield?: string;
  fromValue: string;
  frequencyType: string;
  frequencyValue: string;
  id: string;
  startedAt: number;
  isCreatingPair: boolean;
  oracle: Oracles;
  addressFor: string;
  version: PositionVersions;
}

export interface NewPairTypeData {
  id?: number | string;
  token0: Token;
  token1: Token;
}

export type TransactionPositionTypeDataOptions =
  | WithdrawTypeData
  | AddFundsTypeData
  | ModifySwapsPositionTypeData
  | ModifyRateAndSwapsPositionTypeData
  | TerminatePositionTypeData
  | RemoveFundsTypeData
  | NewPositionTypeData
  | ResetPositionTypeData
  | ApproveCompanionTypeData
  | ModifyPermissionsTypeData
  | MigratePositionTypeData
  | WithdrawFundsTypeData
  | MigratePositionYieldTypeData
  | TransferTypeData;

export type TransactionTypeDataOptions =
  | WithdrawTypeData
  | AddFundsTypeData
  | ModifySwapsPositionTypeData
  | ModifyRateAndSwapsPositionTypeData
  | TerminatePositionTypeData
  | ApproveTokenTypeData
  | WrapEtherTypeData
  | RemoveFundsTypeData
  | NewPositionTypeData
  | ResetPositionTypeData
  | NewPairTypeData
  | ApproveCompanionTypeData
  | ModifyPermissionsTypeData
  | MigratePositionTypeData
  | WithdrawFundsTypeData
  | MigratePositionYieldTypeData
  | TransferTypeData;

export interface TransactionDetails {
  hash: string;
  isCleared?: boolean;
  approval?: { tokenAddress: string; spender: string };
  summary?: string;
  claim?: { recipient: string };
  retries: number;
  receipt?: TransactionReceipt;
  chainId: number;
  lastCheckedBlockNumber?: number;
  addedTime: number;
  confirmedTime?: number;
  from: string;
  type: TransactionTypes;
  typeData: TransactionTypeDataOptions;
  position?: Position;
}
