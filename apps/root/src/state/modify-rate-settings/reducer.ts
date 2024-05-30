import { createReducer } from '@reduxjs/toolkit';
import {
  setFromValue,
  setFrequencyValue,
  setUseWrappedProtocolToken,
  initializeModifyRateSettings,
  setRate,
  resetModifySettingsModal,
} from './actions';

export interface ModifyRateSettingsState {
  // used for safe checking
  fromValue: string;
  frequencyValue: string;
  rate: string;
  useWrappedProtocolToken: boolean;
}

const initialState: ModifyRateSettingsState = {
  fromValue: '0.0',
  frequencyValue: '0',
  rate: '0.0',
  useWrappedProtocolToken: false,
};
export default createReducer(initialState, (builder) => {
  builder
    .addCase(initializeModifyRateSettings, (state, { payload: { fromValue, frequencyValue, rate } }) => {
      state.fromValue = fromValue;
      state.rate = rate;
      state.frequencyValue = frequencyValue;
      state.useWrappedProtocolToken = false;
    })
    .addCase(setFromValue, (state, { payload }) => {
      state.fromValue = payload;
    })
    .addCase(setRate, (state, { payload }) => {
      state.rate = payload;
    })
    .addCase(setFrequencyValue, (state, { payload }) => {
      state.frequencyValue = payload;
    })
    .addCase(setUseWrappedProtocolToken, (state, { payload }) => {
      state.useWrappedProtocolToken = payload;
    })
    .addCase(resetModifySettingsModal, () => ({
      ...initialState,
    }));
});
