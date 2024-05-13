import { NETWORKS } from './addresses';

export const MINIMUM_USD_RATE_FOR_YIELD: Record<number, number> = {
  [NETWORKS.polygon.chainId]: 1,
  [NETWORKS.optimism.chainId]: 5,
  [NETWORKS.arbitrum.chainId]: 5,
  [NETWORKS.mainnet.chainId]: 15,
  [NETWORKS.xdai.chainId]: 0.001,
  [NETWORKS.baseGoerli.chainId]: 1,
  [NETWORKS.moonbeam.chainId]: 5,
};

export const DEFAULT_MINIMUM_USD_RATE_FOR_YIELD = 5;

export const PLATFORM_NAMES_FOR_TOKENS: Record<string, string> = {
  'Aave v3': 'AAVE',
  Exactly: 'EXACTLY',
  'Sonne Finance': 'SONNE',
  'Yearn Finance': 'YEARN',
  Moonwell: 'MOONWELL',
  Venus: 'VENUS',
  Agave: 'AGAVE',
  Beefy: 'BEEFY',
};
