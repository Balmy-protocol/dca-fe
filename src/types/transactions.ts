import { Log } from '@ethersproject/providers';
import { PositionVersions } from 'config';
import { Oracles } from './contracts';
import { Permission, Position } from './positions';
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
  gasUsed: string;
  effectiveGasPrice: string;
  cumulativeGasUsed: string;
  logs: Array<Log>;
  blockNumber: number;
  confirmations: number;
  byzantium: boolean;
  type: number;
  status?: number;
  chainId: number;
}

export type TransactionTypes =
  // Common
  | 'APPROVE_TOKEN'
  | 'APPROVE_TOKEN_EXACT'
  // DCA
  | 'NEW_POSITION'
  | 'NEW_PAIR'
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
  | 'RESET_POSITION'
  // AGGREGATOR
  | 'SWAP'
  | 'WRAP'
  | 'UNWRAP'
  // EULER CLAIM
  | 'EULER_CLAIM_TERMINATE_MANY'
  | 'EULER_CLAIM_PERMIT_MANY'
  | 'EULER_CLAIM_APPROVE_MIGRATOR'
  | 'EULER_CLAIM_CLAIM_FROM_MIGRATOR';

export type TransactionTypesConstant = Record<TransactionTypes, TransactionTypes>;

export interface SwapTypeData {
  from: string;
  to: string;
  amountFrom: string;
  amountTo: string;
  balanceBefore: string | null;
  transferTo?: string | null;
}

export interface WrapTypeData {
  from: string;
  to: string;
  amountFrom: string;
  amountTo: string;
}

export interface UnwrapTypeData {
  from: string;
  to: string;
  amountFrom: string;
  amountTo: string;
}

export interface WithdrawTypeData {
  id: number | string;
  withdrawnUnderlying: string | null;
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
  toWithdraw: string;
  remainingLiquidity: string;
}

export interface ApproveTokenTypeData {
  token: Token;
  addressFor: string;
}

export interface ApproveTokenExactTypeData {
  token: Token;
  addressFor: string;
  amount: string;
}

export interface WrapEtherTypeData {
  amount: string;
}

export interface EulerClaimTerminateManyTypeData {
  id: string;
  positionIds: string[];
}

export interface EulerClaimPermitManyTypeData {
  id: string;
  positionIds: string[];
  permissions: Permission[];
  permittedAddress: string;
}

export interface EulerClaimApproveMigratorTypeData {
  token: Token;
  id: string;
}

export interface EulerClaimClaimFromMigratorTypeData {
  token: Token;
  id: string;
}

export interface NoOpTypeData {
  id: string;
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

export type TransactionAggregatorTypeDataOptions = SwapTypeData;

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
  | TransferTypeData
  | EulerClaimTerminateManyTypeData
  | EulerClaimPermitManyTypeData
  | NoOpTypeData;

export type TransactionPositionManyTypeDataOptions = EulerClaimTerminateManyTypeData | EulerClaimPermitManyTypeData;

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
  | TransferTypeData
  | TransactionAggregatorTypeDataOptions
  | EulerClaimTerminateManyTypeData
  | EulerClaimPermitManyTypeData
  | NoOpTypeData;

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
  realSafeHash?: string;
}
