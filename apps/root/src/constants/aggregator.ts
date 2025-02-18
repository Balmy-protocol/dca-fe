import { buildSDK, Chains, TimeString } from '@balmy/sdk';
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

export const GAS_LABELS_BY_KEY: Record<GasKeys, ReturnType<typeof defineMessage>> = {
  [GAS_KEY_SAFE_LOW]: defineMessage({
    defaultMessage: 'Standard',
    description: 'aggregator.settings.gas-speed.standard',
  }),
  [GAS_KEY_AVERAGE]: defineMessage({ defaultMessage: 'Fast', description: 'aggregator.settings.gas-speed.fast' }),
  [GAS_KEY_FAST]: defineMessage({ defaultMessage: 'Instant', description: 'aggregator.settings.gas-speed.instant' }),
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
  disabledDexes: ['portals-fi', 'bebop', 'magpie'],
  showTransactionCost: true,
  confetti: 100,
  sorting: SORT_MOST_RETURN,
  isPermit2Enabled: true,
  sourceTimeout: TimeoutKey.balance,
};

const tempSdk = buildSDK();
const aggSupportedChains = tempSdk.quoteService.supportedChains();

export const AGGREGATOR_SUPPORTED_CHAINS: ChainId[] = [
  Chains.ARBITRUM.chainId,
  Chains.AVALANCHE.chainId,
  Chains.BASE.chainId,
  Chains.BNB_CHAIN.chainId,
  Chains.CELO.chainId,
  Chains.CRONOS.chainId,
  Chains.ETHEREUM.chainId,
  Chains.FANTOM.chainId,
  Chains.GNOSIS.chainId,
  Chains.KAVA.chainId,
  Chains.KAIA.chainId,
  Chains.LINEA.chainId,
  Chains.MOONBEAM.chainId,
  Chains.OPTIMISM.chainId,
  Chains.POLYGON.chainId,
  Chains.POLYGON_ZKEVM.chainId,
  Chains.ROOTSTOCK.chainId,
  Chains.SCROLL.chainId,
  Chains.MODE.chainId,
  Chains.BLAST.chainId,
  Chains.CRONOS.chainId,
  Chains.MANTLE.chainId,
].filter((chainId) => aggSupportedChains.includes(chainId));
