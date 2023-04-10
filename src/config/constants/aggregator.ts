export const GAS_KEY_SAFE_LOW = 'standard';
export const GAS_KEY_AVERAGE = 'fast';
export const GAS_KEY_FAST = 'instant';

export type GasKeys = typeof GAS_KEY_SAFE_LOW | typeof GAS_KEY_AVERAGE | typeof GAS_KEY_FAST;

export const GAS_KEYS: GasKeys[] = [GAS_KEY_SAFE_LOW, GAS_KEY_AVERAGE, GAS_KEY_FAST];

export const GAS_LABELS_BY_KEY: Record<GasKeys, string> = {
  [GAS_KEY_SAFE_LOW]: 'standard',
  [GAS_KEY_AVERAGE]: 'fast',
  [GAS_KEY_FAST]: 'instant',
};

export const SORT_MOST_PROFIT = 'most-swapped-accounting-for-gas';
export const SORT_MOST_RETURN = 'most-swapped';
export const SORT_LEAST_GAS = 'least-gas';

export type SwapSortOptions = typeof SORT_MOST_PROFIT | typeof SORT_LEAST_GAS | typeof SORT_MOST_RETURN;

export const SWAP_ROUTES_SORT_OPTIONS: Record<SwapSortOptions, SwapSortOptions> = {
  [SORT_MOST_PROFIT]: 'most-swapped-accounting-for-gas',
  [SORT_LEAST_GAS]: 'least-gas',
  [SORT_MOST_RETURN]: 'most-swapped',
};

export const DEFAULT_AGGREGATOR_SETTINGS: {
  gasSpeed: GasKeys;
  slippage: number;
  disabledDexes: string[];
  showTransactionCost: boolean;
  confetti: number;
  sorting: SwapSortOptions;
} = {
  slippage: 0.3,
  gasSpeed: GAS_KEY_AVERAGE,
  disabledDexes: ['firebird', 'portals-fi', 'wido'],
  showTransactionCost: true,
  confetti: 100,
  sorting: SORT_MOST_RETURN,
};
