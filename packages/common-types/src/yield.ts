import { Token } from './tokens';

export enum YieldName {
  aave = 'Aave V3',
  agave = 'Agave',
  beefy = 'Beefy',
  sonne = 'Sonne',
  exactly = 'Exactly',
  yearn = 'Yearn',
  euler = 'Euler',
  venus = 'Venus',
  moonwell = 'Moonwell',
}

export interface YieldOption {
  id: string;
  poolId: string;
  name: YieldName;
  apy: number;
  enabledTokens: string[];
  token: Token;
  tokenAddress: string;
  forcedUnderlyings?: string[];
}

export type YieldOptions = YieldOption[];
