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
  name: YieldName;
  apy: number;
  enabledTokens: string[];
  token: Token;
  tokenAddress: string;
}

export type YieldOptions = YieldOption[];
