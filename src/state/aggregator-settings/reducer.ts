import { createReducer } from '@reduxjs/toolkit';
import { DEFAULT_AGGREGATOR_SETTINGS, GasKeys } from 'config/constants/aggregator';
import { setSlippage, setGasSpeed, restoreDefaults, setDisabledDexes } from './actions';

export interface AggregatorSettingsState {
  gasSpeed: GasKeys;
  slippage: string;
  disabledDexes: string[];
}

const initialState: AggregatorSettingsState = {
  gasSpeed: DEFAULT_AGGREGATOR_SETTINGS.gasSpeed,
  slippage: DEFAULT_AGGREGATOR_SETTINGS.slippage.toString(),
  disabledDexes: [],
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
    .addCase(restoreDefaults, (state) => {
      state.gasSpeed = DEFAULT_AGGREGATOR_SETTINGS.gasSpeed;
      state.slippage = DEFAULT_AGGREGATOR_SETTINGS.slippage.toString();
    })
);
