import { createReducer } from '@reduxjs/toolkit';
import { DEFAULT_AGGREGATOR_SETTINGS, GasKeys, SwapSortOptions } from '@constants/aggregator';
import {
  setSlippage,
  setGasSpeed,
  restoreDefaults,
  setDisabledDexes,
  setShowTransactionCost,
  setConfetti,
  setSorting,
  setPermit2,
} from './actions';

export interface AggregatorSettingsState {
  gasSpeed: GasKeys;
  slippage: string;
  disabledDexes: string[];
  showTransactionCost: boolean;
  confettiParticleCount: number;
  sorting: SwapSortOptions;
  isPermit2Enabled: boolean;
}

const initialState: AggregatorSettingsState = {
  gasSpeed: DEFAULT_AGGREGATOR_SETTINGS.gasSpeed,
  slippage: DEFAULT_AGGREGATOR_SETTINGS.slippage.toString(),
  disabledDexes: DEFAULT_AGGREGATOR_SETTINGS.disabledDexes,
  showTransactionCost: DEFAULT_AGGREGATOR_SETTINGS.showTransactionCost,
  confettiParticleCount: DEFAULT_AGGREGATOR_SETTINGS.confetti,
  sorting: DEFAULT_AGGREGATOR_SETTINGS.sorting,
  isPermit2Enabled: DEFAULT_AGGREGATOR_SETTINGS.isPermit2Enabled,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setSlippage, (state, { payload }) => {
      state.slippage = payload;
    })
    .addCase(setGasSpeed, (state, { payload }) => {
      state.gasSpeed = payload;
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
    .addCase(setConfetti, (state, { payload }) => {
      state.confettiParticleCount = payload;
    })
    .addCase(setPermit2, (state, { payload }) => {
      state.isPermit2Enabled = payload;
    })
    .addCase(restoreDefaults, (state) => {
      state.gasSpeed = DEFAULT_AGGREGATOR_SETTINGS.gasSpeed;
      state.slippage = DEFAULT_AGGREGATOR_SETTINGS.slippage.toString();
      state.disabledDexes = DEFAULT_AGGREGATOR_SETTINGS.disabledDexes;
      state.showTransactionCost = DEFAULT_AGGREGATOR_SETTINGS.showTransactionCost;
      state.confettiParticleCount = DEFAULT_AGGREGATOR_SETTINGS.confetti;
      state.isPermit2Enabled = DEFAULT_AGGREGATOR_SETTINGS.isPermit2Enabled;
    })
);
