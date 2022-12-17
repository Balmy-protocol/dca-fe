export const GAS_KEY_SAFE_LOW = 'safeLow';
export const GAS_KEY_AVERAGE = 'average';
export const GAS_KEY_FAST = 'fast';

export type GasKeys = typeof GAS_KEY_SAFE_LOW | typeof GAS_KEY_AVERAGE | typeof GAS_KEY_FAST;

export const GAS_KEYS: GasKeys[] = [GAS_KEY_SAFE_LOW, GAS_KEY_AVERAGE, GAS_KEY_FAST];

export const GAS_LABELS_BY_KEY: Record<GasKeys, string> = {
  [GAS_KEY_SAFE_LOW]: 'Low',
  [GAS_KEY_AVERAGE]: 'Average',
  [GAS_KEY_FAST]: 'Fast',
};

export const DEFAULT_AGGREGATOR_SETTINGS: { gasSpeed: GasKeys; slippage: number } = {
  slippage: 0.3,
  gasSpeed: GAS_KEY_AVERAGE,
};

export const SORT_MOST_PROFIT = 'most-profit';
export const SORT_LEAST_GAS = 'least-gas';

export type SwapSortOptions = typeof SORT_MOST_PROFIT | typeof SORT_LEAST_GAS;

export const SWAP_ROUTES_SORT_OPTIONS: Record<SwapSortOptions, SwapSortOptions> = {
  [SORT_MOST_PROFIT]: 'most-profit',
  [SORT_LEAST_GAS]: 'least-gas',
};
