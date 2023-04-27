import type Web3Service from 'services/web3Service';
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

export type SetStateCallback<T> = React.Dispatch<React.SetStateAction<T>>;

export { Web3Service };

export type Web3ServicePromisableMethods =
  | 'connect'
  | 'disconnect'
  | 'setUpModal'
  | 'getBalance'
  | 'getEstimatedPairCreation'
  | 'getCurrentPositions'
  | 'getNetwork'
  | 'getUsedTokens'
  | 'getAvailablePairs'
  | 'getAllowance'
  | 'canSupportPair'
  | 'getPastPositions'
  | 'getPairOracle'
  | 'getUsdPrice';

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
}

export type ChainId = number;

export type TransactionActionApproveTokenType = 'APPROVE_TOKEN';
export type TransactionActionApproveTokenSignType = 'APPROVE_TOKEN_SIGN';
export type TransactionActionWaitForSignApprovalType = 'WAIT_FOR_SIGN_APPROVAL';
export type TransactionActionWaitForApprovalType = 'WAIT_FOR_APPROVAL';
export type TransactionActionWaitForSimulationType = 'WAIT_FOR_SIMULATION';
export type TransactionActionSwapType = 'SWAP';

export type TransactionActionType =
  // Common
  | TransactionActionApproveTokenType
  | TransactionActionApproveTokenSignType
  | TransactionActionWaitForApprovalType
  | TransactionActionWaitForSimulationType
  | TransactionActionWaitForSignApprovalType
  | TransactionActionSwapType;

export interface TransactionActionApproveTokenData {
  token: Token;
  amount: BigNumber;
  swapper: string;
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

export interface TransactionActionSwapData {
  from: Token;
  to: Token;
  sellAmount: BigNumber;
  buyAmount: BigNumber;
}

export type TransactionActionExtraData =
  | TransactionActionApproveTokenData
  | TransactionActionWaitForApprovalData
  | TransactionActionSwapData;
