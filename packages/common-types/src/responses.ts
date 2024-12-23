import { Token } from './tokens';
import { AccountLabels } from './accountLabels';
import { PriceResult } from '@balmy/sdk';
import { Address, AmountOfToken, ChainId, TokenAddress, PreparedTransactionRequest } from '.';
import { TransactionApiEvent } from './accountHistory';
import { TransactionRequest } from 'viem';

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
  gasEth: bigint;
}

export interface MeanFinanceResponse {
  tx: PreparedTransactionRequest;
}

export interface MeanFinanceConfigResponse {
  supportedPairs: { tokenA: string; tokenB: string }[];
  minSwapInterval: {
    id: number;
    label: string;
  };
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

export type ApiWallet = { address: Address; isAuth: boolean; isOwner: boolean };
export type ApiNewWallet = { address: Address } & ApiWalletAdminConfig;
export type ApiWalletAdminConfig = { isAuth: true; signature: string; expiration: string } | { isAuth: false };

export interface AccountBalancesResponse {
  balances: Record<Address, Record<ChainId, Record<TokenAddress, AmountOfToken>>>;
}

export interface IndexingData {
  processedUpTo: string;
  detectedUpTo: string;
  target: string;
}

export type TransactionApiIndexing = Record<
  Address,
  Record<IndexerUnits, Record<ChainId, IndexingData>> | { error: string }
>;
export interface TransactionsHistoryResponse {
  events: TransactionApiEvent[];
  indexed: TransactionApiIndexing;
  pagination: {
    moreEvents: boolean;
  };
}

export enum IndexerUnits {
  DCA = 'dca',
  EARN = 'earn',
  AGG_SWAPS = 'aggSwaps',
  CHAINLINK_REGISTRY = 'chainlinkRegistry',
  ERC20_APPROVALS = 'erc20Approvals',
  ERC20_TRANSFERS = 'erc20Transfers',
  NATIVE_TRANSFERS = 'nativeTransfers',
}

export type ApiIndexingResponse = {
  status: Record<IndexerUnits, Record<ChainId, IndexingData & { status: 'indexing' | 'failed' | 'stopped' }>>;
};
