import { BigNumber } from 'ethers';

export enum TokenType {
  BASE = 'BASE',
  WRAPPED_PROTOCOL_TOKEN = 'WRAPPED_PROTOCOL_TOKEN',
  YIELD_BEARING_SHARE = 'YIELD_BEARING_SHARE',
  ERC20_TOKEN = 'ERC20_TOKEN',
  ERC721_TOKEN = 'ERC721_TOKEN',
}

export type Token = {
  decimals: number;
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  logoURI?: string;
  type: TokenType;
  underlyingTokens: Token[];
};

export interface TokenWithUSD extends Token {
  balance: BigNumber;
  balanceUSD: number;
}

export type TokenList = Record<string, Token>;

export interface TokensLists {
  name: string;
  logoURI: string;
  timestamp: number;
  tokens: Token[];
  version: Version;
  hasLoaded: boolean;
  requestId: string;
  fetchable: boolean;
  priority: number;
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

export interface Tags {
  stablecoin: Compound;
  compound: Compound;
}

export interface Compound {
  name: string;
  description: string;
}

export interface Version {
  major: number;
  minor: number;
  patch: number;
}

export interface TokenListResponse {
  name: string;
  logoURI: string;
  keywords: string[];
  tags: Tags;
  timestamp: number;
  tokens: Token[];
  version: Version;
}
