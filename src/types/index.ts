import type Web3Service from 'services/web3Service';
import React from 'react';
import { BigNumber } from 'ethers';

export type SetStateCallback<T> = React.Dispatch<React.SetStateAction<T>>;

export { Web3Service };

export type Token = {
  chainId: number;
  decimals: number;
  address: string;
  name: string;
  symbol: string;
  logoURI: string;
};

export type TokenList = Record<string, Token>;

export type AvailablePairResponse = {
  token0: {
    id: string;
  };
  token1: {
    id: string;
  };
  id: string;
  status: string; // active, stale
};

export type AvailablePair = {
  token0: string;
  token1: string;
  id: string;
  status: string; // active, stale
};

export type AvailablePairs = AvailablePair[];

export type Web3ServicePromisableMethods =
  | 'connect'
  | 'disconnect'
  | 'setUpModal'
  | 'getBalance'
  | 'getEstimatedPairCreation'
  | 'getCurrentPositions'
  | 'getNetwork'
  | 'getUsedTokens'
  | 'createPair'
  | 'getAvailablePairs'
  | 'getAllowance'
  | 'getPastPositions';

export type PositionResponse = {
  id: string;
  from: {
    id: string;
  };
  to: {
    id: string;
  };
  pair: {
    id: string;
  };
  status: string;
  swapInterval: {
    id: string;
    interval: BigNumber;
    description: BigNumber;
  };
  current: {
    id: string;
    rate: BigNumber;
    remainingSwaps: BigNumber;
    swapped: BigNumber;
    withdrawn: BigNumber;
    remainingLiquidity: BigNumber;
  };
  createdAtTimestamp: number;
};

export interface PositionRaw {
  from: string;
  to: string;
  swapInterval: BigNumber; // daily/weekly/etc
  swapped: BigNumber; // total de swappeado
  startedAt: Date;
  remainingLiquidity: BigNumber;
  remainingSwaps: BigNumber;
  withdrawn: BigNumber; // cuanto saque
  id: number;
  status: string;
}

export interface Position extends Omit<PositionRaw, 'to' | 'from'> {
  from: Token;
  to: Token;
}

export interface Network {
  chainId: number;
}

export type PositionsRaw = PositionRaw[];
export type Positions = Position[];

export interface GasNowResponseData {
  rapid: number;
  fast: number;
  standard: number;
  slow: number;
  timestamp: number;
}

export interface GasNowResponse {
  code: number;
  data: GasNowResponseData;
}

export interface CoinGeckoTokenPriceResponse {
  id: string;
  current_price: number;
}

export type CoinGeckoPriceResponse = CoinGeckoTokenPriceResponse[];

export interface UsedTokenInfo {
  address: string;
}

export interface UsedToken {
  tokenInfo: UsedTokenInfo;
}

export interface GetUsedTokensData {
  tokens: UsedToken[];
}

export interface GetUsedTokensDataResponse {
  data: GetUsedTokensData;
}

export type GetAllowanceResponse = string;

export interface EstimatedPairResponse {
  gas: string;
  gasUsd: number;
  gasEth: string;
}

export interface TransactionReceipt {
  to: string;
  from: string;
  contractAddress: string;
  transactionIndex: number;
  blockHash: string;
  transactionHash: string;
  blockNumber: number;
  status?: number;
}

export interface TransactionDetails {
  hash: string;
  approval?: { tokenAddress: string; spender: string };
  summary?: string;
  claim?: { recipient: string };
  receipt?: TransactionReceipt;
  lastCheckedBlockNumber?: number;
  addedTime: number;
  confirmedTime?: number;
  from: string;
}

export type TransactionTypes =
  | 'NEW_POSITION'
  | 'NEW_PAIR'
  | 'APPROVE_TOKEN'
  | 'TERMINATE_POSITION'
  | 'WITHDRAW_POSITION'
  | 'ADD_FUNDS_POSITION'
  | 'MODIFY_RATE_POSITION';
