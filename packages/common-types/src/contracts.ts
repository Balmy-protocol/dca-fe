import { Address } from 'viem';

export interface PermissionSet {
  operator: Address;
  permissions: number[];
}

export interface PermissionPermit {
  permissions: PermissionSet[];
  tokenId: bigint;
  deadline: string;
  v: number | string;
  r: string;
  s: string;
}

export type Oracles = 0 | 1 | 2;
