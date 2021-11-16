import type Web3Service from 'services/web3Service';
import React from 'react';
import { BigNumber } from 'ethers';

export type SetStateCallback<T> = React.Dispatch<React.SetStateAction<T>>;

export { Web3Service };

export type Token = {
  decimals: number;
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  logoURI?: string;
};

export type GetPoolResponse = {
  pools: {
    id: string;
  }[];
};

export type PoolResponse = {
  token0: {
    decimals: string;
    id: string;
    name: string;
    symbol: string;
    totalValueLockedUSD: string;
    chainId: number;
  };
  token1: {
    decimals: string;
    id: string;
    name: string;
    symbol: string;
    totalValueLockedUSD: string;
    chainId: number;
  };
  id: string;
};

export type TokenList = Record<string, Token>;

export interface AvailablePairSwap {
  executedAtTimestamp: number;
}

export type AvailablePairResponse = {
  tokenA: {
    id: string;
  };
  tokenB: {
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

export interface GetNextSwapInfo {
  swapsToPerform: {
    interval: number;
  }[];
}

export type AvailablePair = {
  token0: Token;
  token1: Token;
  lastExecutedAt: number;
  createdAt: number;
  id: string;
  swapInfo: GetNextSwapInfo;
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
  | 'hasPool'
  | 'getPastPositions';

export type PositionResponse = {
  id: string;
  dcaId: string;
  from: Token;
  to: Token;
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
  rate: BigNumber;
  totalDeposits: BigNumber;
  totalSwaps: BigNumber;
  totalSwapped: BigNumber;
  totalWithdrawn: BigNumber;
  createdAtTimestamp: number;
};

export interface Position {
  from: Token;
  to: Token;
  swapInterval: BigNumber; // daily/weekly/etc
  swapped: BigNumber; // total de swappeado
  remainingLiquidity: BigNumber;
  remainingSwaps: BigNumber;
  totalDeposits: BigNumber;
  withdrawn: BigNumber; // cuanto saque
  totalSwaps: BigNumber; // cuanto puse originalmente
  rate: BigNumber;
  dcaId: string;
  id: string;
  status: string;
  startedAt: number;
  pendingTransaction: string;
  pairId: string;
}

export interface FullPosition {
  from: Token;
  to: Token;
  totalDeposits: string;
  totalSwaps: string; // cuanto puse originalmente
  dcaId: string;
  id: string;
  status: string;
  startedAt: number;
  pendingTransaction: string;
  pair: {
    id: string;
    tokenA: Token;
    tokenB: Token;
  };
  createdAtTimestamp: string;
  totalSwapped: string;
  totalWithdrawn: string;
  startedAtSwap: string;
  terminatedAtTimestamp: string;
  swapInterval: {
    id: string;
    interval: string;
    description: string;
  };
  current: PositionState;
  history: PositionState[];
}

export interface PositionState {
  id: string;
  startingSwap: string;
  rate: string;
  lastSwap: string;
  remainingSwaps: string;
  swapped: string;
  withdrawn: string;
  remainingLiquidity: string;
  createdAtBlock: string;
  createdAtTimestamp: string;
  transaction: {
    id: string;
    hash: string;
    timestamp: string;
  };
}

export interface PairSwapsIntervals {
  id: string;
  swapInterval: {
    id: string;
    interval: string;
    description: string;
  };
  swapPerformed: string;
}
export interface PairSwaps {
  id: string;
  executedAtTimestamp: string;
  executedAtBlock: string;
  ratePerUnitBToAWithFee: string;
  ratePerUnitAToBWithFee: string;
  transaction: {
    id: string;
    hash: string;
    index: string;
    gasSent: string;
    gasPrice: string;
    from: string;
    timestamp: string;
  };
  pairSwapsIntervals: PairSwapsIntervals[];
}

export interface GetPairSwapsData {
  id: string;
  createdAtTimestamp: string;
  tokenA: {
    id: string;
  };
  tokenB: {
    id: string;
  };
  swaps: PairSwaps[];
}

export interface PositionKeyBy {
  [key: string]: Position;
}

export interface Network {
  chainId: number;
}

export type Positions = Position[];

export interface TxPriceResponse {
  unit: string;
  blockPrices: {
    estimatedPrices: {
      price: number;
      maxPriorityFeePerGas: number;
      maxFeePerGas: number;
    }[];
  }[];
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

export type GetAllowanceResponse = {
  allowance: string;
  token: Token;
};

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
  pair: string;
}

export interface WrapEtherTypeData {
  amount: string;
}

export interface NewPositionTypeData {
  from: Token;
  to: Token;
  fromValue: string;
  frequencyType: string;
  frequencyValue: string;
  existingPair: AvailablePair;
  id: string;
  startedAt: number;
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
  | ResetPositionTypeData;

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
  | NewPairTypeData;

export interface TransactionDetails {
  hash: string;
  isCleared?: boolean;
  approval?: { tokenAddress: string; spender: string };
  summary?: string;
  claim?: { recipient: string };
  retries: number;
  receipt?: TransactionReceipt;
  lastCheckedBlockNumber?: number;
  addedTime: number;
  confirmedTime?: number;
  from: string;
  type: TransactionTypes;
  typeData: TransactionTypeDataOptions;
}

export interface NFTData {
  description: string;
  image: string;
  name: string;
}

export interface PoolLiquidityData {
  id: string;
  poolDayData: {
    id: string;
    volumeUSD: string;
  }[];
}
export type PoolsLiquidityData = PoolLiquidityData[];

export interface GetPairResponseSwapData {
  id: string;
  executedAtTimestamp: string;
  ratePerUnitAToB: string;
  ratePerUnitBToA: string;
}

export interface GetPairPriceResponseData {
  pair: {
    id: string;
    swaps: GetPairResponseSwapData[];
  };
}
export interface TokensLists {
  name: string;
  logoURI: string;
  keywords: string[];
  tags: Tags;
  timestamp: Date;
  tokens: TokenList;
  version: Version;
}

export interface TokenListResponse {
  name: string;
  logoURI: string;
  keywords: string[];
  tags: Tags;
  timestamp: Date;
  tokens: Token[];
  version: Version;
}

export interface Tags {
  stablecoin: Compound;
  compound: Compound;
}

export interface Compound {
  name: string;
  description: string;
}

export interface TokenListToken {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  tags: string[];
}

export interface Version {
  major: number;
  minor: number;
  patch: number;
}
