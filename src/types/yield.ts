import { Token } from './tokens';

export interface YieldOption {
  id: string;
  poolId: string;
  name: string;
  apy: number;
  enabledTokens: string[];
  token: Token;
}

export type YieldOptions = YieldOption[];
