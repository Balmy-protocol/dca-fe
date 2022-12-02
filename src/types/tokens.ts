import { ECDSASignature } from 'ethereumjs-util';
import { BigNumber } from 'ethers';

type TokenTypeBase = 'BASE';
type TokenTypeWrapped = 'WRAPPED_PROTOCOL_TOKEN';
type TokenTypeYieldBearingShares = 'YIELD_BEARING_SHARES';

export type TokenType = TokenTypeBase | TokenTypeWrapped | TokenTypeYieldBearingShares;

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

export type TokenList = Record<string, Token>;

export interface TokensLists {
  name: string;
  logoURI: string;
  timestamp: number;
  tokens: Token[];
  version: Version;
  hasLoaded: boolean;
  requestId: string;
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

export enum PermitType {
  AMOUNT = 1,
  ALLOWED = 2,
}

export interface PermitDomain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
  type: PermitType;
}

interface BaseSignatureData {
  v: ECDSASignature['v'];
  r: ECDSASignature['r'];
  s: ECDSASignature['s'];
  deadline: BigNumber;
  nonce: number;
  owner: string;
  spender: string;
  chainId: number;
  tokenAddress: string;
  permitType: PermitType;
}

interface StandardSignatureData extends BaseSignatureData {
  amount: string;
}

interface AllowedSignatureData extends BaseSignatureData {
  allowed: true;
}

export type SignatureData = StandardSignatureData | AllowedSignatureData;
