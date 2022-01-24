import { createReducer } from '@reduxjs/toolkit';
import {
  setFromValue,
  setFrequencyValue,
  setUseWrappedProtocolToken,
  setActiveStep,
  initializeModifyRateSettings,
} from './actions';

export interface ModifyRateSettingsState {
  // used for safe checking
  activeStep: number;
  fromValue: string;
  frequencyValue: string;
  useWrappedProtocolToken: boolean;
}

const initialState: ModifyRateSettingsState = {
  activeStep: 0,
  fromValue: '0',
  frequencyValue: '0',
  useWrappedProtocolToken: false,
};
export default createReducer(initialState, (builder) =>
  builder
    .addCase(initializeModifyRateSettings, (state, { payload: { fromValue, frequencyValue } }) => {
      state.fromValue = fromValue;
      state.frequencyValue = frequencyValue;
      state.useWrappedProtocolToken = false;
      state.activeStep = 0;
    })
    .addCase(setFromValue, (state, { payload }) => {
      state.fromValue = payload;
    })
    .addCase(setFrequencyValue, (state, { payload }) => {
      state.frequencyValue = payload;
    })
    .addCase(setUseWrappedProtocolToken, (state, { payload }) => {
      state.useWrappedProtocolToken = payload;
    })
    .addCase(setActiveStep, (state, { payload }) => {
      state.activeStep = payload;
    })
);
