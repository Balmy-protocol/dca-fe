import { ChainId } from 'common-types';
import { Address } from 'viem';

export type HackLandingId = string;

export type HackLandingMetadata = {
  creator: Address;
  title: string;
  description: string;
  links: string[];
};
export type HackLanding = {
  id: HackLandingId;
  metadata: HackLandingMetadata;
  affectedContracts: Record<ChainId, Address[]>;
};
