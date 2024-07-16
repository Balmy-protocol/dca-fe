import { createReducer } from '@reduxjs/toolkit';
import { DEFAULT_AGGREGATOR_SETTINGS, GasKeys, SwapSortOptions, TimeoutKey } from '@constants/aggregator';
import {
  setSlippage,
  setGasSpeed,
  restoreDefaults,
  setDisabledDexes,
  setShowTransactionCost,
  setSorting,
  setSourceTimeout,
  setPermit2,
  hydrateAggregatorSettings,
} from './actions';
import { isUndefined } from 'lodash';

export interface AggregatorSettingsState {
  gasSpeed: GasKeys;
  slippage: string;
  disabledDexes: string[];
  showTransactionCost: boolean;
  confettiParticleCount: number;
  sorting: SwapSortOptions;
  isPermit2Enabled: boolean;
  sourceTimeout: TimeoutKey;
}

export const initialState: AggregatorSettingsState = {
  gasSpeed: DEFAULT_AGGREGATOR_SETTINGS.gasSpeed,
  slippage: DEFAULT_AGGREGATOR_SETTINGS.slippage.toString(),
  disabledDexes: DEFAULT_AGGREGATOR_SETTINGS.disabledDexes,
  showTransactionCost: DEFAULT_AGGREGATOR_SETTINGS.showTransactionCost,
  confettiParticleCount: DEFAULT_AGGREGATOR_SETTINGS.confetti,
  sorting: DEFAULT_AGGREGATOR_SETTINGS.sorting,
  isPermit2Enabled: DEFAULT_AGGREGATOR_SETTINGS.isPermit2Enabled,
  sourceTimeout: DEFAULT_AGGREGATOR_SETTINGS.sourceTimeout,
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(setSlippage, (state, { payload }) => {
      state.slippage = payload;
    })
    .addCase(setGasSpeed, (state, { payload }) => {
      state.gasSpeed = payload;
    })
    .addCase(setSourceTimeout, (state, { payload }) => {
      state.sourceTimeout = payload;
    })
    .addCase(setDisabledDexes, (state, { payload }) => {
      state.disabledDexes = payload;
    })
    .addCase(setSorting, (state, { payload }) => {
      state.sorting = payload;
    })
    .addCase(setShowTransactionCost, (state, { payload }) => {
      state.showTransactionCost = payload;
    })
    .addCase(setPermit2, (state, { payload }) => {
      state.isPermit2Enabled = payload;
    })
    .addCase(hydrateAggregatorSettings, (state, { payload }) => {
      if (!isUndefined(payload.confettiParticleCount)) {
        state.confettiParticleCount = payload.confettiParticleCount;
      }
      if (!isUndefined(payload.gasSpeed)) {
        state.gasSpeed = payload.gasSpeed;
      }
      if (!isUndefined(payload.slippage)) {
        state.slippage = payload.slippage;
      }
      if (!isUndefined(payload.sourceTimeout)) {
        state.sourceTimeout = payload.sourceTimeout;
      }
      if (!isUndefined(payload.disabledDexes)) {
        state.disabledDexes = payload.disabledDexes;
      }
      if (!isUndefined(payload.showTransactionCost)) {
        state.showTransactionCost = payload.showTransactionCost;
      }
      if (!isUndefined(payload.isPermit2Enabled)) {
        state.isPermit2Enabled = payload.isPermit2Enabled;
      }
      if (!isUndefined(payload.sorting)) {
        state.sorting = payload.sorting;
      }
    })
    .addCase(restoreDefaults, (state) => {
      state.gasSpeed = DEFAULT_AGGREGATOR_SETTINGS.gasSpeed;
      state.slippage = DEFAULT_AGGREGATOR_SETTINGS.slippage.toString();
      state.sourceTimeout = DEFAULT_AGGREGATOR_SETTINGS.sourceTimeout;
      state.disabledDexes = DEFAULT_AGGREGATOR_SETTINGS.disabledDexes;
      state.showTransactionCost = DEFAULT_AGGREGATOR_SETTINGS.showTransactionCost;
      state.confettiParticleCount = DEFAULT_AGGREGATOR_SETTINGS.confetti;
      state.isPermit2Enabled = DEFAULT_AGGREGATOR_SETTINGS.isPermit2Enabled;
      state.sorting = DEFAULT_AGGREGATOR_SETTINGS.sorting;
      state.sourceTimeout = DEFAULT_AGGREGATOR_SETTINGS.sourceTimeout;
    });
});
