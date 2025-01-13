import React from 'react';
import { PermitData, QuoteTransaction, AmountsOfToken as SdkAmountOfToken } from '@balmy/sdk';

import { Token } from './tokens';
import { BlowfishResponse } from './responses';
import { Hex, SignMessageReturnType } from 'viem';
import { EarnPermission, EarnPermissionData, WithdrawType } from '@balmy/sdk/dist/services/earn/types';

export * from './tokens';
export * from './positions';
export * from './pairs';
export * from './responses';
export * from './transactions';
export * from './contracts';
export * from './yield';
export * from './aggregator';
export * from './sdk';
export * from './campaigns';
export * from './account';
export * from './contactList';
export * from './accountLabels';
export * from './accountHistory';
export * from './providerInfo';
export * from './earn';
export * from './tiers';

export type SetStateCallback<T> = React.Dispatch<React.SetStateAction<T>>;

// export { Web3Service };

export type Web3ServicePromisableMethods =
  | 'connect'
  | 'disconnect'
  | 'setUpModal'
  | 'getBalance'
  | 'getCurrentPositions'
  | 'getNetwork'
  | 'getUsedTokens'
  | 'getAvailablePairs'
  | 'getAllowance'
  | 'canSupportPair'
  | 'getPastPositions';

export interface Network {
  chainId: number;
}

export interface NetworkStruct {
  chainId: number;
  name: string;
  mainCurrency: string;
  nativeCurrency: Partial<Token>;
  rpc: string[];
  mainColor?: string;
  wToken?: string;
  testnet?: boolean;
}

export type ChainId = number;
export type Address = `0x${string}`;
export type TokenAddress = string;
export type AmountOfToken = string;
export type Timestamp = number;

export type TransactionActionApproveTokenType = 'APPROVE_TOKEN';
export type TransactionActionApproveTokenSignSwapType = 'APPROVE_TOKEN_SIGN_SWAP';
export type TransactionActionApproveTokenSignDCAType = 'APPROVE_TOKEN_SIGN_DCA';
export type TransactionActionApproveTokenSignEarnType = 'APPROVE_TOKEN_SIGN_EARN';
export type TransactionActionWaitForSimulationType = 'WAIT_FOR_SIMULATION';
export type TransactionActionSwapType = 'SWAP';
export type TransactionActionEarnDepositType = 'EARN_DEPOSIT';
export type TransactionActionCreatePositionType = 'CREATE_POSITION';
export type TransactionActionApproveCompanionSignEarnType = 'APPROVE_COMPANION_SIGN_EARN';
export type TransactionActionEarnWithdrawType = 'EARN_WITHDRAW';
export type TransactionActionEarnSignToSType = 'SIGN_TOS_EARN';

export type TransactionActionType =
  // Common
  | TransactionActionApproveTokenType
  | TransactionActionApproveTokenSignSwapType
  | TransactionActionApproveTokenSignDCAType
  | TransactionActionWaitForSimulationType
  | TransactionActionSwapType
  | TransactionActionEarnDepositType
  | TransactionActionEarnSignToSType
  | TransactionActionApproveTokenSignEarnType
  | TransactionActionCreatePositionType
  | TransactionActionApproveCompanionSignEarnType
  | TransactionActionEarnWithdrawType;

export enum AllowanceType {
  specific = 'specific',
  max = 'max',
}
export interface TransactionActionApproveTokenData {
  token: Token;
  amount: bigint;
  swapper: string;
  defaultApproval?: AllowanceType;
  help?: string;
  isPermit2Enabled?: boolean;
  allowsExactApproval?: boolean;
}

export enum SignStatus {
  none = 'none',
  signed = 'signed',
  failed = 'failed',
}

export interface TransactionActionApproveTokenSignDCAData {
  signStatus: SignStatus;
}

export interface TransactionActionApproveTokenSignSwapData extends TransactionActionApproveTokenSignDCAData {
  swapper: string;
  to: Token;
  toAmount: bigint;
  from: Token;
  fromAmount: bigint;
  simulation?: BlowfishResponse;
}

export interface TransactionActionApproveTokenSignEarnData extends TransactionActionApproveTokenSignDCAData {
  asset: Token;
  assetAmount: bigint;
}

export interface TransactionActionSignToSEarnData extends TransactionActionApproveTokenSignDCAData {
  tos: string;
}

export interface TransactionActionWaitForSimulationData {
  tx: QuoteTransaction;
  chainId: number;
  simulation?: BlowfishResponse;
}

export interface TransactionActionSwapData {
  from: Token;
  to: Token;
  sellAmount: bigint;
  buyAmount: bigint;
  signature?: { deadline: number; nonce: bigint; rawSignature: string };
}

export interface TransactionActionEarnDepositData {
  asset: Token;
  assetAmount: bigint;
  permitSignature?: PermitData['permitData'] & { signature: Hex };
  permissionSignature?: EarnPermissionData['permitData'] & { signature: Hex };
  tosSignature?: SignMessageReturnType;
}

export interface TransactionActionCreatePositionData {
  from: Token;
  to: Token;
  fromValue: string;
  frequencyType: bigint;
  frequencyValue: string;
  signature?: { deadline: number; nonce: bigint; rawSignature: string };
}

export interface TransactionActionApproveCompanionSignEarnData {
  type: EarnPermission;
  signStatus: SignStatus;
}

export interface TransactionActionEarnWithdrawData {
  asset: Token;
  withdraw: {
    token: Token;
    amount: bigint;
  }[];
  signature?: EarnPermissionData['permitData'] & { signature: Hex };
  assetWithdrawType: WithdrawType;
}

export interface AmountsOfToken extends DistributiveOmit<SdkAmountOfToken, 'amount'> {
  amount: bigint;
}
