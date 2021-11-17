export type Token = {
  decimals: number;
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  logoURI?: string;
};

export type TokenList = Record<string, Token>;

export interface TokensLists {
  name: string;
  logoURI: string;
  keywords: string[];
  tags: Tags;
  timestamp: Date;
  tokens: TokenList;
  version: Version;
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
  timestamp: Date;
  tokens: Token[];
  version: Version;
}
