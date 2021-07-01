import type Web3Service from 'services/web3Service';
import React from 'react';
import { BigNumber } from 'ethers';

type SetStateCallback<T> = React.Dispatch<React.SetStateAction<T>>;

type Token = {
  chainId: number;
  decimals: number;
  address: string;
  name: string;
  symbol: string;
  logoURI: string;
};

type TokenList = Record<string, Token>;

type AvailablePairResponse = {
  token0: {
    id: string;
  };
  token1: {
    id: string;
  };
  id: string;
  status: string; // active, stale
};

type AvailablePair = {
  token0: string;
  token1: string;
  id: string;
  status: string; // active, stale
};

type AvailablePairs = AvailablePair[];

type Web3ServicePromisableMethods =
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
  | 'getAllowance';

interface CurrentPositionRaw {
  from: string;
  to: string;
  swapInterval: number; // daily/weekly/etc
  swapped: BigNumber; // total de swappeado
  startedAt: Date;
  remainingLiquidity: BigNumber;
  remainingSwaps: number;
  withdrawn: BigNumber; // cuanto saque
  id: number;
  status: string; // current
}

interface CurrentPosition {
  from: Token;
  to: Token;
  swapInterval: number; // daily/weekly/etc
  swapped: BigNumber; // total de swappeado
  startedAt: Date;
  remainingLiquidity: BigNumber;
  remainingSwaps: number;
  withdrawn: BigNumber; // cuanto saque
  id: number;
  status: string; // current
}

interface PastPosition {
  from: string;
  to: string;
  swapInterval: number; // daily/weekly/etc
  swapped: BigNumber;
  startedAt: Date;
  totalDeposit: BigNumber;
  swapsExecuted: number;
  id: number;
  status: string; // terminated
}

interface Network {
  chainId: number;
}

type CurrentPositions = CurrentPositionRaw[];

interface GasNowResponseData {
  rapid: number;
  fast: number;
  standard: number;
  slow: number;
  timestamp: number;
}

interface GasNowResponse {
  code: number;
  data: GasNowResponseData;
}

interface CoinGeckoTokenPriceResponse {
  id: string;
  current_price: number;
}

type CoinGeckoPriceResponse = CoinGeckoTokenPriceResponse[];

interface UsedTokenInfo {
  address: string;
}

interface UsedToken {
  tokenInfo: UsedTokenInfo;
}

interface GetUsedTokensData {
  tokens: UsedToken[];
}

interface GetUsedTokensDataResponse {
  data: GetUsedTokensData;
}

type GetAllowanceResponse = string;

interface EstimatedPairResponse {
  gas: string;
  gasUsd: number;
  gasEth: string;
}

export {
  Web3Service,
  SetStateCallback,
  Token,
  TokenList,
  AvailablePair,
  AvailablePairs,
  Web3ServicePromisableMethods,
  CurrentPosition,
  CurrentPositions,
  GasNowResponse,
  CoinGeckoPriceResponse,
  Network,
  GetUsedTokensDataResponse,
  EstimatedPairResponse,
  GetAllowanceResponse,
  AvailablePairResponse,
};
