import { BigNumber } from 'ethers';
import { TokenWithUSD } from './tokens';

export type RawCampaigns = Record<
  number,
  Record<
    string,
    {
      tokens: {
        token: string;
        amount: string;
      }[];
      expiresOn: string;
      proof?: string[];
      name: string;
    }
  >
>;

export interface CampaignWithoutToken {
  tokens: {
    address: string;
    balance: BigNumber;
    usdPrice: BigNumber;
  }[];
  expiresOn: string;
  id: string;
  title: string;
  chainId: number;
  proof?: string[];
}

export type CampaignsWithoutToken = CampaignWithoutToken[];

export interface Campaign {
  tokens: TokenWithUSD[];
  expiresOn: string;
  id: string;
  title: string;
  chainId: number;
  proof?: string[];
}

export type Campaigns = Campaign[];
