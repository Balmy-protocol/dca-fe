import React from 'react';
import { QuoteTransaction, AmountsOfToken as SdkAmountOfToken } from '@balmy/sdk';

import { Token } from './tokens';
import { BlowfishResponse } from './responses';

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
export type TransactionActionWaitForSimulationType = 'WAIT_FOR_SIMULATION';
export type TransactionActionSwapType = 'SWAP';
export type TransactionActionCreatePositionType = 'CREATE_POSITION';

export type TransactionActionType =
  // Common
  | TransactionActionApproveTokenType
  | TransactionActionApproveTokenSignSwapType
  | TransactionActionApproveTokenSignDCAType
  | TransactionActionWaitForSimulationType
  | TransactionActionSwapType
  | TransactionActionCreatePositionType;

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

export interface TransactionActionCreatePositionData {
  from: Token;
  to: Token;
  fromValue: string;
  frequencyType: bigint;
  frequencyValue: string;
  signature?: { deadline: number; nonce: bigint; rawSignature: string };
}

export interface AmountsOfToken extends Omit<SdkAmountOfToken, 'amount'> {
  amount: bigint;
}
