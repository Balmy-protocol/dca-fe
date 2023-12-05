import React from 'react';
import { QuoteTransaction } from '@mean-finance/sdk';
import { BigNumber } from 'ethers';
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
export type Address = string;
export type TokenAddress = string;
export type AmountOfToken = string;

export type TransactionActionApproveTokenType = 'APPROVE_TOKEN';
export type TransactionActionApproveTokenSignType = 'APPROVE_TOKEN_SIGN';
export type TransactionActionWaitForSignApprovalType = 'WAIT_FOR_SIGN_APPROVAL';
export type TransactionActionWaitForApprovalType = 'WAIT_FOR_APPROVAL';
export type TransactionActionWaitForSimulationType = 'WAIT_FOR_SIMULATION';
export type TransactionActionWaitForQuotesSimulationType = 'WAIT_FOR_QUOTES_SIMULATION';
export type TransactionActionSwapType = 'SWAP';
export type TransactionActionCreatePositionType = 'CREATE_POSITION';

export type TransactionActionType =
  // Common
  | TransactionActionApproveTokenType
  | TransactionActionApproveTokenSignType
  | TransactionActionWaitForApprovalType
  | TransactionActionWaitForSimulationType
  | TransactionActionWaitForQuotesSimulationType
  | TransactionActionWaitForSignApprovalType
  | TransactionActionSwapType
  | TransactionActionCreatePositionType;

export enum AllowanceType {
  specific = 'specific',
  max = 'max',
}
export interface TransactionActionApproveTokenData {
  token: Token;
  amount: BigNumber;
  swapper: string;
  defaultApproval?: AllowanceType;
  help?: string;
  isPermit2Enabled?: boolean;
}

export interface TransactionActionWaitForApprovalData {
  token: Token;
  amount: BigNumber;
}

export interface TransactionActionWaitForSimulationData {
  tx: QuoteTransaction;
  chainId: number;
  simulation?: BlowfishResponse;
}

export interface TransactionActionWaitForQuotesSimulationData {
  simulation?: BlowfishResponse;
  quotes: number;
}

export interface TransactionActionSwapData {
  from: Token;
  to: Token;
  sellAmount: BigNumber;
  buyAmount: BigNumber;
  signature?: { deadline: number; nonce: BigNumber; rawSignature: string };
}

export interface TransactionActionCreatePositionData {
  from: Token;
  to: Token;
  fromValue: string;
  frequencyType: BigNumber;
  frequencyValue: string;
  signature?: { deadline: number; nonce: BigNumber; rawSignature: string };
}

export type TransactionActionExtraData =
  | TransactionActionApproveTokenData
  | TransactionActionWaitForApprovalData
  | TransactionActionSwapData
  | TransactionActionCreatePositionData;
