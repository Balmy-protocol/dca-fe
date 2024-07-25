import { ChainId, Timestamp, Token } from 'common-types';
import { Address } from 'viem';

export type HackLandingId = string;

export type HackLandingMetadata = {
  creator?: {
    address?: Address;
    twitter?: Address;
  };
  title: string;
  description: string;
  // { url: label }
  links?: Record<string, string>;
};
export type HackLanding = {
  id: HackLandingId;
  metadata: HackLandingMetadata;
  affectedContracts: Record<ChainId, Address[]>;
  createdAt: Timestamp;
  lastUpdatedAt: Timestamp;
};

export type DisplayChainAllowances = Record<
  Address,
  Record<
    Address,
    Record<
      Address,
      {
        token: Token;
        amount: bigint;
      }
    >
  >
>;

export type ChainAllowances = Record<Address, Record<Address, Record<Address, bigint>>>;

export type SavedAllowance = Record<
  ChainId,
  {
    isLoading: boolean;
    allowances: ChainAllowances;
  }
>;

export type DisplayAllowance = Record<
  ChainId,
  {
    isLoading: boolean;
    allowances: DisplayChainAllowances;
  }
>;
