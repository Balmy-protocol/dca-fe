import { TransactionRequest } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { PermissionData } from './positions';
import { Token } from './tokens';
import { AccountLabels } from './accountLabels';
import { PriceResult } from '@mean-finance/sdk';
import { Address, AmountOfToken, ChainId, TokenAddress } from '@types';
import { TransactionEvent } from './accountHistory';

export interface PoolLiquidityData {
  id: string;
  poolHourData: {
    id: string;
    volumeUSD: string;
  }[];
}

export type PoolsLiquidityData = PoolLiquidityData[];

export interface PoolsLiquidityDataGraphqlResponse {
  pools: PoolsLiquidityData;
}
export interface GetPairResponseSwapData {
  id: string;
  executedAtTimestamp: string;
  ratioAToB: string;
  ratioBToA: string;
  pairSwapsIntervals: {
    swapInterval: {
      interval: string;
    };
  }[];
}

export interface GetPairPriceResponseData {
  pair: {
    id: string;
    swaps: GetPairResponseSwapData[];
  };
}

export interface PositionsGraphqlResponse {
  positions: PositionResponse[];
}

export interface SwapIntervalGraphqlResponse {
  id: string;
  interval: string;
  active: boolean;
}
export interface GetSwapIntervalsGraphqlResponse {
  swapIntervals: SwapIntervalGraphqlResponse[];
}
export type PositionResponse = {
  id: string;
  from: Token;
  to: Token;
  user: string;
  pair: {
    id: string;
    activePositionsPerInterval: number[];
    swaps: {
      id: string;
      executedAtTimestamp: string;
    }[];
  };
  status: string;
  totalExecutedSwaps: BigNumber;
  swapInterval: {
    id: string;
    interval: BigNumber;
    description: BigNumber;
  };
  remainingSwaps: BigNumber;
  swapped: BigNumber;
  withdrawn: BigNumber;
  remainingLiquidity: BigNumber;
  toWithdraw: BigNumber;
  depositedRateUnderlying: Nullable<BigNumber>;
  totalSwappedUnderlyingAccum: Nullable<BigNumber>;
  toWithdrawUnderlyingAccum: Nullable<BigNumber>;
  rate: BigNumber;
  totalDeposited: BigNumber;
  totalSwaps: BigNumber;
  totalSwapped: BigNumber;
  totalWithdrawn: BigNumber;
  createdAtTimestamp: number;
  permissions?: PermissionData[];
};

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

export type CurrentPriceForChainResponse = Record<string, PriceResult>;

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

export interface PoolsGraphqlResponse {
  pools: PoolResponse[];
}
export interface AvailablePairSwap {
  executedAtTimestamp: number;
}

export type AvailablePairResponse = {
  tokenA: Token;
  tokenB: Token;
  id: string;
  swaps: AvailablePairSwap[];
  createdAtTimestamp: number;
  status: string; // active, stale
  oldestActivePositionCreatedAt: number;
  activePositionsPerInterval: [number, number, number, number, number, number, number, number];
  lastSwappedAt: [number, number, number, number, number, number, number, number];
};

export interface AvailablePairsGraphqlResponse {
  pairs: AvailablePairResponse[];
}

export interface DefillamaResponse {
  data: {
    apy: number;
    apyBase: number;
    underlyingTokens?: string[];
    pool: string;
  }[];
}

export interface MeanFinanceResponse {
  tx: TransactionRequest;
}

export interface MeanFinanceAllowedPairsResponse {
  supportedPairs: { tokenA: string; tokenB: string }[];
}

export interface MeanApiUnderlyingResponse {
  underlying: Record<
    string,
    {
      underlying: string;
      underlyingAmount: string;
    }
  >;
}

export type RawSwapOption = {
  sellAmount: {
    amount: string;
    amountInUnits: string;
    amountInUSD: string;
  };
  buyAmount: {
    amount: string;
    amountInUnits: string;
    amountInUSD: string;
  };
  maxSellAmount: {
    amount: string;
    amountInUnits: string;
    amountInUSD: string;
  };
  minBuyAmount: {
    amount: string;
    amountInUnits: string;
    amountInUSD: string;
  };
  gas: {
    estimatedGas: string;
    estimatedCost: string;
    estimatedCostInUnits: string;
    estimatedCostInUSD: string;
    gasTokenSymbol: string;
  };
  swapper: {
    allowanceTarget: string;
    address: string;
    id: string;
    name: string;
    logoURI: string;
  };
  type: string;
  tx: TransactionRequest;
};

export type FailedSwapOption = {
  failed: true;
  dex: string;
};

export interface MeanFinanceSwapResponse {
  swap: {
    sellToken: {
      address: string;
      decimals: number;
      symbol: string;
    };
    buyToken: {
      address: string;
      decimals: number;
      symbol: string;
    };
    config: {
      gasSpeed: string;
      slippagePercentage: number;
    };
    quotes: (RawSwapOption | FailedSwapOption)[];
  };
}

export enum StateChangeKind {
  ERC20_TRANSFER = 'ERC20_TRANSFER',
  ERC20_APPROVAL = 'ERC20_APPROVAL',
  NATIVE_ASSET_TRANSFER = 'NATIVE_ASSET_TRANSFER',
  ERC721_TRANSFER = 'ERC721_TRANSFER',
  ERC721_APPROVAL = 'ERC721_APPROVAL',
  ERC721_APPROVAL_FOR_ALL = 'ERC721_APPROVAL_FOR_ALL',
  ERC1155_TRANSFER = 'ERC1155_TRANSFER',
  ERC1155_APPROVAL_FOR_ALL = 'ERC1155_APPROVAL_FOR_ALL',
}

export interface BlowfishReponseData {
  amount: {
    before: string;
    after: string;
  };
  asset?: {
    address: string;
    decimals: number;
    symbol: string;
  };
  contract?: {
    address: string;
  };
}
export interface BlowfishResponse {
  action: 'BLOCK' | 'WARN' | 'NONE';
  warnings: {
    severity: 'CRITICAL' | 'WARNING';
    message: string;
  }[];
  simulationResults: {
    error?: { humanReadableError: string };
    expectedStateChanges: {
      humanReadableDiff: string;
      rawInfo: {
        kind: StateChangeKind;
        data: BlowfishReponseData;
      };
    }[];
  };
}

export interface AccountLabelsAndContactListResponse {
  labels: AccountLabels;
  contacts: { wallet: string }[];
}

export type ApiWallet = { address: string; isAuth: boolean };
export type ApiNewWallet = { address: string } & ApiWalletAdminConfig;
export type ApiWalletAdminConfig = { isAuth: true; signature: string; expiration: string } | { isAuth: false };

export interface AccountBalancesResponse {
  balances: Record<Address, Record<ChainId, Record<TokenAddress, AmountOfToken>>>;
}

export interface TransactionsHistoryResponse {
  events: TransactionEvent[];
  indexing: Record<
    Address,
    Record<
      ChainId,
      {
        processedUpTo: string;
        detectedUpTo: string;
        target: string;
      }
    >
  >;
  pagination: {
    moreEvents: boolean;
  };
}
