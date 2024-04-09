import { Chains, TimeString } from '@mean-finance/sdk';
import { ChainId } from '@types';
import { defineMessage } from 'react-intl';

export const SLIPPAGE_PREDEFINED_RANGES = [
  {
    value: '0.1',
  },
  {
    value: '0.3',
  },
  {
    value: '1',
  },
];

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

export const TIMEOUT_KEYS_BY_CHAIN: Record<ChainId, Record<TimeoutKey, TimeString>> = {
  [Chains.ROOTSTOCK.chainId]: {
    [TimeoutKey.instant]: '2.8s',
    [TimeoutKey.rapid]: '5.6s',
    [TimeoutKey.balance]: '10s',
    [TimeoutKey.patient]: '14s',
  },
};

export const getTimeoutKeyForChain = (chainId: number, key: TimeoutKey): TimeString =>
  (TIMEOUT_KEYS_BY_CHAIN[chainId] && TIMEOUT_KEYS_BY_CHAIN[chainId][key]) || key;

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

export const SWAP_ROUTES_SORT_OPTIONS: Record<
  SwapSortOptions,
  { label: ReturnType<typeof defineMessage>; help: ReturnType<typeof defineMessage> }
> = {
  [SORT_MOST_PROFIT]: {
    label: defineMessage({
      description: 'sortHighReturn',
      defaultMessage: 'Gas cost considered',
    }),
    help: defineMessage({
      description: 'sortHighReturnHelp',
      defaultMessage: 'Sort routes by the best relation between price and gas cost',
    }),
  },
  [SORT_LEAST_GAS]: {
    label: defineMessage({ description: 'sortLeastGas', defaultMessage: 'Least gas' }),
    help: defineMessage({ description: 'sortLeastGasHelp', defaultMessage: 'Sort routes by least gas spent' }),
  },
  [SORT_MOST_RETURN]: {
    label: defineMessage({
      description: 'sortMostReturnSellOrder',
      defaultMessage: 'Most received tokens / Less spent tokens (for buy orders)',
    }),
    help: defineMessage({
      description: 'sortMostReturnSellOrderHelp',
      defaultMessage: 'Sort routes by where you can receive more tokens/spend less tokens',
    }),
  },
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
  disabledDexes: ['portals-fi', 'bebop'],
  showTransactionCost: true,
  confetti: 100,
  sorting: SORT_MOST_RETURN,
  isPermit2Enabled: true,
  sourceTimeout: TimeoutKey.balance,
};
