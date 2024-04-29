import { Address } from 'viem';
import { TokenWithUSD } from './tokens';

export enum CampaignTypes {
  // Common
  common = 'COMMON',

  // OP Airdrop
  optimismAirdrop = 'OPTIMISM_AIRDROP',
}

export interface CommonTypeData {
  type: CampaignTypes.common;
  typeData: unknown;
}

export type CampaignTypeDataOptions = OptimismTypeData | CommonTypeData;

export interface OptimismAirdropCampaingResponse {
  positions: {
    id: number;
    from: string;
    to: string;
    version: 'beta' | 'vulnerable';
    volume: number;
  }[];
  totalBoostedVolume: number;
  op: string;
  proof: string[];
}

export type RawCampaignBase = {
  tokens: {
    token: string;
    decimals: number;
    symbol: string;
    name: string;
    amount: string;
  }[];
  expiresOn?: string;
  proof?: string[];
  name: string;
  claimContract: string;
  claimed: boolean;
};

export type RawCampaign<T extends CampaignTypeDataOptions = CampaignTypeDataOptions> = RawCampaignBase & T;

export type RawCampaigns = Record<number, Record<string, RawCampaign>>;

export type CampaignWithoutTokenBase = {
  tokens: {
    address: Address;
    decimals: number;
    symbol: string;
    name: string;
    balance: bigint;
    usdPrice: bigint;
  }[];
  expiresOn?: string;
  id: string;
  title: string;
  chainId: number;
  proof?: Address[];
  claimContract?: Address;
  claimed: boolean;
};

export interface OptimismTypeData {
  type: CampaignTypes.optimismAirdrop;
  typeData: {
    positions: {
      id: number;
      from: string;
      to: string;
      version: 'beta' | 'vulnerable';
      volume: number;
    }[];
  };
}

export type CampaignWithoutToken<T extends CampaignTypeDataOptions = CampaignTypeDataOptions> =
  CampaignWithoutTokenBase & T;

export type CampaignsWithoutToken = CampaignWithoutToken[];

export type Campaign<T extends CampaignTypeDataOptions = CampaignTypeDataOptions> = Omit<
  CampaignWithoutToken<T>,
  'tokens'
> & {
  tokens: TokenWithUSD[];
};

export type Campaigns = Campaign[];
