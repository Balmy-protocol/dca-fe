import { defineMessage } from 'react-intl';

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

export enum TimeoutKey {
  instant = '1s',
  rapid = '2s',
  balance = '3.5s',
  patient = '5s',
}

export const TIMEOUT_KEYS: TimeoutKey[] = [
  TimeoutKey.instant,
  TimeoutKey.rapid,
  TimeoutKey.balance,
  TimeoutKey.patient,
];

export const TIMEOUT_LABELS_BY_KEY: Record<TimeoutKey, ReturnType<typeof defineMessage>> = {
  [TimeoutKey.instant]: defineMessage({ defaultMessage: 'Instant', description: 'swapSettingsTimeoutInstantKey' }),
  [TimeoutKey.rapid]: defineMessage({ defaultMessage: 'Rapid', description: 'swapSettingsTimeoutRapidKey' }),
  [TimeoutKey.balance]: defineMessage({ defaultMessage: 'Balance', description: 'swapSettingsTimeoutBalanceKey' }),
  [TimeoutKey.patient]: defineMessage({ defaultMessage: 'Patient', description: 'swapSettingsTimeoutPatientKey' }),
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
  isPermit2Enabled: boolean;
  sourceTimeout: TimeoutKey;
} = {
  slippage: 0.3,
  gasSpeed: GAS_KEY_AVERAGE,
  disabledDexes: ['portals-fi'],
  showTransactionCost: true,
  confetti: 100,
  sorting: SORT_MOST_RETURN,
  isPermit2Enabled: true,
  sourceTimeout: TimeoutKey.balance,
};
