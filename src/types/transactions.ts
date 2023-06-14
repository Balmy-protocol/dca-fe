import { Log } from '@ethersproject/providers';
import { Permission, Position, PositionPermission, PositionVersions } from './positions';
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

export enum TransactionTypes {
  // Common
  approveToken = 'APPROVE_TOKEN',
  approveTokenExact = 'APPROVE_TOKEN_EXACT',
  // DCA
  newPosition = 'NEW_POSITION',
  newPair = 'NEW_PAIR',
  wrapEther = 'WRAP_ETHER',
  terminatePosition = 'TERMINATE_POSITION',
  withdrawPosition = 'WITHDRAW_POSITION',
  noOp = 'NO_OP',
  modifyRateAndSwapsPosition = 'MODIFY_RATE_AND_SWAPS_POSITION',
  transferPosition = 'TRANSFER_POSITION',
  approveCompanion = 'APPROVE_COMPANION',
  modifyPermissions = 'MODIFY_PERMISSIONS',
  migratePositionYield = 'MIGRATE_POSITION_YIELD',
  withdrawFunds = 'WITHDRAW_FUNDS',
  // AGGREGATOR
  swap = 'SWAP',
  wrap = 'WRAP',
  unwrap = 'UNWRAP',
  // EULER CLAIM
  eulerClaimTerminateMany = 'EULER_CLAIM_TERMINATE_MANY',
  eulerClaimPermitMany = 'EULER_CLAIM_PERMIT_MANY',
  eulerClaimApproveMigrator = 'EULER_CLAIM_APPROVE_MIGRATOR',
  eulerClaimClaimFromMigrator = 'EULER_CLAIM_CLAIM_FROM_MIGRATOR',
  // CAMPAIGNS
  claimCampaign = 'CLAIM_CAMPAIGN',
}

export type TransactionTypesConstant = Record<TransactionTypes, TransactionTypes>;

export interface SwapTypeData {
  type: TransactionTypes.swap;
  typeData: {
    from: string;
    to: string;
    amountFrom: string;
    amountTo: string;
    balanceBefore: string | null;
    transferTo?: string | null;
  };
}

export interface WrapTypeData {
  type: TransactionTypes.wrap;
  typeData: {
    from: string;
    to: string;
    amountFrom: string;
    amountTo: string;
  };
}

export interface UnwrapTypeData {
  type: TransactionTypes.unwrap;
  typeData: {
    from: string;
    to: string;
    amountFrom: string;
    amountTo: string;
  };
}

export interface WithdrawTypeData {
  type: TransactionTypes.withdrawPosition;
  typeData: {
    id: number | string;
    withdrawnUnderlying: string | null;
  };
}

export interface WithdrawFundsTypeData {
  type: TransactionTypes.withdrawFunds;
  typeData: {
    id: number | string;
    from: string;
    removedFunds: string;
  };
}

export interface TransferTypeData {
  type: TransactionTypes.transferPosition;
  typeData: {
    id: number | string;
    from: string;
    to: string;
    toAddress: string;
  };
}

export interface ModifyPermissionsTypeData {
  type: TransactionTypes.modifyPermissions;
  typeData: {
    id: number | string;
    permissions: PositionPermission[];
    from: string;
    to: string;
  };
}

export interface MigratePositionYieldTypeData {
  type: TransactionTypes.migratePositionYield;
  typeData: {
    id: number | string;
    from: string;
    to: string;
    fromYield?: string;
    toYield?: string;
    newId?: string;
  };
}

export interface ApproveCompanionTypeData {
  type: TransactionTypes.approveCompanion;
  typeData: {
    id: number | string;
    from: string;
    to: string;
  };
}

export interface ModifyRateAndSwapsPositionTypeData {
  type: TransactionTypes.modifyRateAndSwapsPosition;
  typeData: {
    id: number | string;
    newRate: string;
    decimals: number;
    newSwaps: string;
  };
}
export interface TerminatePositionTypeData {
  type: TransactionTypes.terminatePosition;
  typeData: {
    id: number | string;
    toWithdraw: string;
    remainingLiquidity: string;
  };
}

export interface ApproveTokenTypeData {
  type: TransactionTypes.approveToken;
  typeData: {
    token: Token;
    addressFor: string;
  };
}

export interface ApproveTokenExactTypeData {
  type: TransactionTypes.approveTokenExact;
  typeData: {
    token: Token;
    addressFor: string;
    amount: string;
  };
}

export interface WrapEtherTypeData {
  type: TransactionTypes.wrapEther;
  typeData: {
    amount: string;
  };
}

export interface EulerClaimTerminateManyTypeData {
  type: TransactionTypes.eulerClaimTerminateMany;
  typeData: {
    id: string;
    positionIds: string[];
  };
}

export interface EulerClaimPermitManyTypeData {
  type: TransactionTypes.eulerClaimPermitMany;
  typeData: {
    id: string;
    positionIds: string[];
    permissions: Permission[];
    permittedAddress: string;
  };
}

export interface EulerClaimApproveMigratorTypeData {
  type: TransactionTypes.eulerClaimApproveMigrator;
  typeData: {
    token: Token;
    id: string;
  };
}

export interface EulerClaimClaimFromMigratorTypeData {
  type: TransactionTypes.eulerClaimClaimFromMigrator;
  typeData: {
    token: Token;
    id: string;
  };
}

export interface NoOpTypeData {
  type: TransactionTypes.noOp;
  typeData: {
    id: string;
  };
}

export interface NewPositionTypeData {
  type: TransactionTypes.newPosition;
  typeData: {
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
    addressFor: string;
    version: PositionVersions;
  };
}

export interface NewPairTypeData {
  type: TransactionTypes.newPair;
  typeData: {
    id?: number | string;
    token0: Token;
    token1: Token;
  };
}

export interface ClaimCampaignTypeData {
  type: TransactionTypes.claimCampaign;
  typeData: {
    id?: number | string;
    name: string;
  };
}

export type TransactionAggregatorTypeDataOptions = SwapTypeData;

export type TransactionPositionTypeDataOptions =
  | WithdrawTypeData
  | ModifyRateAndSwapsPositionTypeData
  | TerminatePositionTypeData
  | NewPositionTypeData
  | ApproveCompanionTypeData
  | ModifyPermissionsTypeData
  | WithdrawFundsTypeData
  | MigratePositionYieldTypeData
  | TransferTypeData
  | EulerClaimTerminateManyTypeData
  | EulerClaimPermitManyTypeData
  | NoOpTypeData;

export type TransactionPositionManyTypeDataOptions = EulerClaimTerminateManyTypeData | EulerClaimPermitManyTypeData;

export type TransactionTypeDataOptions =
  | ApproveTokenExactTypeData
  | WithdrawTypeData
  | ModifyRateAndSwapsPositionTypeData
  | TerminatePositionTypeData
  | ApproveTokenTypeData
  | WrapEtherTypeData
  | NewPositionTypeData
  | NewPairTypeData
  | ApproveCompanionTypeData
  | ModifyPermissionsTypeData
  | WithdrawFundsTypeData
  | MigratePositionYieldTypeData
  | TransferTypeData
  | TransactionAggregatorTypeDataOptions
  | EulerClaimTerminateManyTypeData
  | EulerClaimPermitManyTypeData
  | EulerClaimClaimFromMigratorTypeData
  | WrapTypeData
  | UnwrapTypeData
  | ClaimCampaignTypeData
  | NoOpTypeData;

export type TransactionDetailsBase = {
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
  position?: Position;
  realSafeHash?: string;
};

export type TransactionDetails<T extends TransactionTypeDataOptions = TransactionTypeDataOptions> =
  TransactionDetailsBase & T;

export type TransactionAdderCustomDataBase = {
  summary?: string;
  approval?: { tokenAddress: string; spender: string };
  claim?: { recipient: string };
  position?: Position;
};

export type TransactionAdderCustomData<T extends TransactionTypeDataOptions = TransactionTypeDataOptions> =
  TransactionAdderCustomDataBase & T;

export type TransactionAdderPayloadBase = {
  hash: string;
  from: string;
  approval?: { tokenAddress: string; spender: string };
  claim?: { recipient: string };
  summary?: string;
  chainId: number;
  position?: Position;
};

export type TransactionAdderPayload<T extends TransactionTypeDataOptions = TransactionTypeDataOptions> =
  TransactionAdderPayloadBase & T;
