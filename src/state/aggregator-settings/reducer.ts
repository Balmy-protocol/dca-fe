import { createReducer } from '@reduxjs/toolkit';
import { DEFAULT_AGGREGATOR_SETTINGS, GasKeys } from 'config/constants/aggregator';
import { setSlippage, setGasSpeed, restoreDefaults } from './actions';

export interface AggregatorSettingsState {
  gasSpeed: GasKeys;
  slippage: string;
}

const initialState: AggregatorSettingsState = {
  gasSpeed: DEFAULT_AGGREGATOR_SETTINGS.gasSpeed,
  slippage: DEFAULT_AGGREGATOR_SETTINGS.slippage.toString(),
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setSlippage, (state, { payload }) => {
      state.slippage = payload;
    })
    .addCase(setGasSpeed, (state, { payload }) => {
      state.gasSpeed = payload;
    })
    .addCase(restoreDefaults, (state) => {
      state.gasSpeed = DEFAULT_AGGREGATOR_SETTINGS.gasSpeed;
      state.slippage = DEFAULT_AGGREGATOR_SETTINGS.slippage.toString();
    })
);
