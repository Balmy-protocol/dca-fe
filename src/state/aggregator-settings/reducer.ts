import { createReducer } from '@reduxjs/toolkit';
import { DEFAULT_AGGREGATOR_SETTINGS, GasKeys, SwapSortOptions } from 'config/constants/aggregator';
import {
  setSlippage,
  setGasSpeed,
  restoreDefaults,
  setDisabledDexes,
  setShowTransactionCost,
  setConfetti,
  setSorting,
} from './actions';

export interface AggregatorSettingsState {
  gasSpeed: GasKeys;
  slippage: string;
  disabledDexes: string[];
  showTransactionCost: boolean;
  confettiParticleCount: number;
  sorting: SwapSortOptions;
}

const initialState: AggregatorSettingsState = {
  gasSpeed: DEFAULT_AGGREGATOR_SETTINGS.gasSpeed,
  slippage: DEFAULT_AGGREGATOR_SETTINGS.slippage.toString(),
  disabledDexes: DEFAULT_AGGREGATOR_SETTINGS.disabledDexes,
  showTransactionCost: DEFAULT_AGGREGATOR_SETTINGS.showTransactionCost,
  confettiParticleCount: DEFAULT_AGGREGATOR_SETTINGS.confetti,
  sorting: DEFAULT_AGGREGATOR_SETTINGS.sorting,
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
    .addCase(restoreDefaults, (state) => {
      state.gasSpeed = DEFAULT_AGGREGATOR_SETTINGS.gasSpeed;
      state.slippage = DEFAULT_AGGREGATOR_SETTINGS.slippage.toString();
      state.disabledDexes = DEFAULT_AGGREGATOR_SETTINGS.disabledDexes;
      state.showTransactionCost = DEFAULT_AGGREGATOR_SETTINGS.showTransactionCost;
      state.confettiParticleCount = DEFAULT_AGGREGATOR_SETTINGS.confetti;
    })
);
