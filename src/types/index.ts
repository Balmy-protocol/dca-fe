import type Web3Service from 'services/web3Service';
import React from 'react';
import { BigNumber } from 'ethers';

export type SetStateCallback<T> = React.Dispatch<React.SetStateAction<T>>;

export { Web3Service };

export type Token = {
  decimals: number;
  address: string;
  name: string;
  symbol: string;
  logoURI?: string;
  pairableTokens: string[];
};

export type PoolResponse = {
  token0: {
    decimals: string;
    id: string;
    name: string;
    symbol: string;
  };
  token1: {
    decimals: string;
    id: string;
    name: string;
    symbol: string;
  };
  id: string;
};

export type TokenList = Record<string, Token>;

export interface AvailablePairSwap {
  executedAtTimestamp: number;
}

export type AvailablePairResponse = {
  token0: {
    id: string;
  };
  token1: {
    id: string;
  };
  id: string;
  swaps: AvailablePairSwap[];
  createdAtTimestamp: number;
  status: string; // active, stale
};

export type SwapInterval = {
  id: string;
  interval: BigNumber;
  description: string;
};

export type AvailablePair = {
  token0: string;
  token1: string;
  lastExecutedAt: number;
  createdAt: number;
  id: string;
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
  dcaId: string;
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
  totalDeposits: BigNumber;
  totalSwaps: BigNumber;
  totalSwapped: BigNumber;
  totalWithdrawn: BigNumber;
  createdAtTimestamp: number;
};

export interface PositionRaw {
  from: string;
  to: string;
  swapInterval: BigNumber; // daily/weekly/etc
  swapped: BigNumber; // total de swappeado
  remainingLiquidity: BigNumber;
  remainingSwaps: BigNumber;
  totalDeposits: BigNumber;
  withdrawn: BigNumber; // cuanto saque
  totalSwaps: BigNumber; // cuanto puse originalmente
  dcaId: number;
  id: string;
  status: string;
  startedAt: number;
}

export interface PositionRawKeyBy {
  [key: string]: PositionRaw;
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
  gasEth: BigNumber;
}

interface TransactionReceiptLog {
  data: string;
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
  logs: TransactionReceiptLog[];
}

export type TransactionTypes =
  | 'NEW_POSITION'
  | 'NEW_PAIR'
  | 'APPROVE_TOKEN'
  | 'TERMINATE_POSITION'
  | 'WITHDRAW_POSITION'
  | 'ADD_FUNDS_POSITION'
  | 'NO_OP'
  | 'REMOVE_FUNDS'
  | 'MODIFY_RATE_POSITION'
  | 'RESET_POSITION';

export interface TransactionTypesConstant {
  [key: string]: TransactionTypes;
}

export interface WithdrawTypeData {
  id: number | string;
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
export interface ModifyRatePositionTypeData {
  id: number | string;
  newRate: string;
}
export interface TerminatePositionTypeData {
  id: number | string;
}

export interface ApproveTokenTypeData {
  id: number | string;
  pair: string;
}

export interface NewPositionTypeData {
  from: Token;
  to: Token;
  fromValue: string;
  frequencyType: string;
  frequencyValue: string;
  existingPair: AvailablePair;
  id?: number | string;
  startedAt: number;
}

export interface NewPairTypeData {
  id?: number | string;
  token0: string;
  token1: string;
}

export type TransactionTypeDataOptions =
  | WithdrawTypeData
  | AddFundsTypeData
  | ModifyRatePositionTypeData
  | TerminatePositionTypeData
  | ApproveTokenTypeData
  | RemoveFundsTypeData
  | NewPositionTypeData
  | ResetPositionTypeData
  | NewPairTypeData;

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
  type: TransactionTypes;
  typeData: TransactionTypeDataOptions;
}
