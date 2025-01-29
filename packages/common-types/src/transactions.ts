import { SdkEarnPositionId, StrategyId, WithdrawType } from './earn';
import { Position, PositionPermission, PositionVersions, PositionYieldOption } from './positions';
import { Token } from './tokens';
import { DCAPermission } from '@balmy/sdk';
import { Address, TransactionRequest, TransactionReceipt as ViemTransactionReceipt } from 'viem';

export interface TransactionReceipt extends ViemTransactionReceipt {
  chainId: number;
}

export type TransactionRequestWithFrom = TransactionRequest & {
  from: Address;
};

export type TransactionRequestWithTo = TransactionRequest & {
  to: Address;
};

export type PreparedTransactionRequest = TransactionRequestWithFrom & TransactionRequestWithTo;

export type TransactionRequestWithChain = TransactionRequest &
  TransactionRequestWithTo &
  TransactionRequestWithFrom & {
    chainId: number;
  };

export type SubmittedTransaction = {
  hash: Address;
  from: Address;
  chainId: number;
};

export enum TransactionTypes {
  // DCA
  newPosition = 'NEW_POSITION',
  newPair = 'NEW_PAIR',
  wrapEther = 'WRAP_ETHER',
  terminatePosition = 'TERMINATE_POSITION',
  withdrawPosition = 'WITHDRAW_POSITION',
  addFundsPosition = 'ADD_FUNDS_POSITION',
  noOp = 'NO_OP',
  removeFunds = 'REMOVE_FUNDS',
  modifySwapsPosition = 'MODIFY_SWAPS_POSITION',
  modifyRateAndSwapsPosition = 'MODIFY_RATE_AND_SWAPS_POSITION',
  transferPosition = 'TRANSFER_POSITION',
  approveCompanion = 'APPROVE_COMPANION',
  modifyPermissions = 'MODIFY_PERMISSIONS',
  migratePosition = 'MIGRATE_POSITION',
  migratePositionYield = 'MIGRATE_POSITION_YIELD',
  withdrawFunds = 'WITHDRAW_FUNDS',
  resetPosition = 'RESET_POSITION',
  // EULER CLAIM
  eulerClaimTerminateMany = 'EULER_CLAIM_TERMINATE_MANY',
  eulerClaimPermitMany = 'EULER_CLAIM_PERMIT_MANY',
  eulerClaimApproveMigrator = 'EULER_CLAIM_APPROVE_MIGRATOR',
  eulerClaimClaimFromMigrator = 'EULER_CLAIM_CLAIM_FROM_MIGRATOR',
  // Common
  approveToken = 'APPROVE_TOKEN',
  approveTokenExact = 'APPROVE_TOKEN_EXACT',
  transferToken = 'TRANSFER_TOKEN',
  // AGGREGATOR
  swap = 'SWAP',
  // CAMPAIGNS
  claimCampaign = 'CLAIM_CAMPAIGN',
  // EARN
  earnCreate = 'EARN_CREATE',
  earnIncrease = 'EARN_INCREASE',
  earnWithdraw = 'EARN_WITHDRAW',
  earnSpecialWithdraw = 'EARN_SPECIAL_WITHDRAW',
  earnClaimDelayedWithdraw = 'EARN_CLAIM_DELAYED_WITHDRAW',
}

export const DcaTransactionArrayTypes = [
  TransactionTypes.newPosition,
  TransactionTypes.terminatePosition,
  TransactionTypes.withdrawPosition,
  TransactionTypes.addFundsPosition,
  TransactionTypes.removeFunds,
  TransactionTypes.modifySwapsPosition,
  TransactionTypes.modifyRateAndSwapsPosition,
  TransactionTypes.transferPosition,
  TransactionTypes.approveCompanion,
  TransactionTypes.modifyPermissions,
  TransactionTypes.migratePosition,
  TransactionTypes.migratePositionYield,
  TransactionTypes.withdrawFunds,
  TransactionTypes.resetPosition,
  TransactionTypes.eulerClaimTerminateMany,
  TransactionTypes.eulerClaimPermitMany,
  TransactionTypes.eulerClaimApproveMigrator,
  TransactionTypes.eulerClaimClaimFromMigrator,
] as const;

export type DcaTransactionTypes = (typeof DcaTransactionArrayTypes)[number];

export function isDcaType(
  transactionType: TransactionDetails
): transactionType is TransactionDetails & { type: DcaTransactionTypes } {
  return DcaTransactionArrayTypes.includes(transactionType.type as unknown as DcaTransactionTypes);
}

export const CommonTransactionArrayTypes = [
  TransactionTypes.approveToken,
  TransactionTypes.approveTokenExact,
  TransactionTypes.transferToken,
] as const;

export type CommonTransactionTypes = (typeof CommonTransactionArrayTypes)[number];

export function isCommonType(
  transactionType: TransactionDetails
): transactionType is TransactionDetails & { type: CommonTransactionTypes } {
  return CommonTransactionArrayTypes.includes(transactionType.type as unknown as CommonTransactionTypes);
}

export const EarnTransactionArrayTypes = [
  TransactionTypes.earnCreate,
  TransactionTypes.earnIncrease,
  TransactionTypes.earnWithdraw,
  TransactionTypes.earnSpecialWithdraw,
  TransactionTypes.earnClaimDelayedWithdraw,
] as const;

export type EarnTransactionTypes = (typeof EarnTransactionArrayTypes)[number];

export function isEarnType(
  transactionType: TransactionDetails
): transactionType is TransactionDetails & { type: EarnTransactionTypes } {
  return EarnTransactionArrayTypes.includes(transactionType.type as unknown as EarnTransactionTypes);
}

export const CampaignTransactionArrayTypes = [TransactionTypes.claimCampaign] as const;

export type CampaignTransactionTypes = (typeof CampaignTransactionArrayTypes)[number];

export function isCampaignType(
  transactionType: TransactionDetails
): transactionType is TransactionDetails & { type: CampaignTransactionTypes } {
  return CampaignTransactionArrayTypes.includes(transactionType.type as unknown as CampaignTransactionTypes);
}

export type TransactionTypesConstant = Record<TransactionTypes, TransactionTypes>;

export interface SwapTypeData {
  type: TransactionTypes.swap;
  typeData: {
    from: Token;
    to: Token;
    amountFrom: bigint;
    amountTo: bigint;
    balanceBefore: string | null;
    transferTo?: string | null;
    swapContract: string;
    orderType: 'buy' | 'sell';
    amountFromUsd?: number | null;
    amountToUsd?: number | null;
  };
}

export interface EarnCreateTypeData {
  type: TransactionTypes.earnCreate;
  typeData: {
    asset: Token;
    assetAmount: string;
    depositAsset?: Token;
    depositAssetAmount?: string;
    positionId?: SdkEarnPositionId;
    strategyId: StrategyId;
    vault: Lowercase<Address>;
    amountInUsd?: number;
    isMigration: boolean;
  };
}

export interface EarnIncreaseTypeData {
  type: TransactionTypes.earnIncrease;
  typeData: {
    asset: Token;
    assetAmount: string;
    positionId: SdkEarnPositionId;
    strategyId: StrategyId;
    signedPermit: boolean;
    depositAsset?: Token;
    depositAssetAmount?: string;
    amountInUsd?: number;
    isMigration: boolean;
  };
}

export interface EarnWithdrawTypeData {
  type: TransactionTypes.earnWithdraw;
  typeData: {
    positionId: SdkEarnPositionId;
    strategyId: StrategyId;
    signedPermit: boolean;
    withdrawn: {
      token: Token;
      amount: string;
      withdrawType: WithdrawType;
      intendedWithdrawAmount?: string;
    }[];
  };
}

export interface EarnSpecialWithdrawTypeData {
  type: TransactionTypes.earnSpecialWithdraw;
  typeData: {
    positionId: SdkEarnPositionId;
    strategyId: StrategyId;
    tokens: {
      token: Token;
      amount: string;
      withdrawType: WithdrawType;
    };
  };
}

export interface EarnClaimDelayedWithdrawTypeData {
  type: TransactionTypes.earnClaimDelayedWithdraw;
  typeData: {
    positionId: SdkEarnPositionId;
    strategyId: StrategyId;
    claim: Token;
    withdrawn: string;
  };
}

export interface WithdrawTypeData {
  type: TransactionTypes.withdrawPosition;
  typeData: {
    id: number | string;
    withdrawnUnderlying: string;
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

export interface MigratePositionTypeData {
  type: TransactionTypes.migratePosition;
  typeData: {
    id: number | string;
    from: string;
    to: string;
    fromYield?: string;
    toYield?: string;
    newId?: string;
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

export interface TransferTokenTypeData {
  type: TransactionTypes.transferToken;
  typeData: {
    // id: string;
    token: Token;
    to: string;
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
    permissions: DCAPermission[];
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
    yields: {
      from?: PositionYieldOption;
      to?: PositionYieldOption;
    };
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

export type TransactionEarnTypeDataOptions =
  | EarnCreateTypeData
  | EarnIncreaseTypeData
  | EarnWithdrawTypeData
  | EarnSpecialWithdrawTypeData
  | EarnClaimDelayedWithdrawTypeData;

export type TransactionPositionTypeDataOptions =
  | WithdrawTypeData
  | ModifyRateAndSwapsPositionTypeData
  | TerminatePositionTypeData
  | NewPositionTypeData
  | ApproveCompanionTypeData
  | ModifyPermissionsTypeData
  | WithdrawFundsTypeData
  | MigratePositionYieldTypeData
  | MigratePositionTypeData
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
  | TransferTokenTypeData
  | WrapEtherTypeData
  | NewPositionTypeData
  | NewPairTypeData
  | ApproveCompanionTypeData
  | ModifyPermissionsTypeData
  | WithdrawFundsTypeData
  | MigratePositionTypeData
  | MigratePositionYieldTypeData
  | TransferTypeData
  | SwapTypeData
  | EulerClaimTerminateManyTypeData
  | EulerClaimPermitManyTypeData
  | EulerClaimClaimFromMigratorTypeData
  | ClaimCampaignTypeData
  | EarnCreateTypeData
  | EarnIncreaseTypeData
  | EarnWithdrawTypeData
  | EarnSpecialWithdrawTypeData
  | EarnClaimDelayedWithdrawTypeData
  | NoOpTypeData;

export type TransactionDetailsBase = {
  hash: string;
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
  checking?: boolean;
  lastCheckedAt?: number;
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

export enum TransactionApplicationIdentifier {
  TRANSFER = 'TRANSFER',
  SWAP = 'SWAP',
  DCA = 'DCA',
  EARN_CREATE = 'EARN_CREATE',
  EARN_INCREASE = 'EARN_INCREASE',
  EARN_WITHDRAW = 'EARN_WITHDRAW',
}
