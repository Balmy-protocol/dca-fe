import { createReducer } from '@reduxjs/toolkit';
import { FULL_DEPOSIT_TYPE, RATE_TYPE } from '@constants';
import {
  setFromValue,
  setFrequencyValue,
  setUseWrappedProtocolToken,
  initializeModifyRateSettings,
  setRate,
  setModeType,
  resetModifySettingsModal,
} from './actions';

export interface ModifyRateSettingsState {
  // used for safe checking
  fromValue: string;
  frequencyValue: string;
  rate: string;
  useWrappedProtocolToken: boolean;
  modeType: typeof FULL_DEPOSIT_TYPE | typeof RATE_TYPE;
}

const initialState: ModifyRateSettingsState = {
  fromValue: '0',
  frequencyValue: '0',
  rate: '0',
  useWrappedProtocolToken: false,
  modeType: FULL_DEPOSIT_TYPE,
};
export default createReducer(initialState, (builder) =>
  builder
    .addCase(initializeModifyRateSettings, (state, { payload: { fromValue, frequencyValue, rate, modeType } }) => {
      state.fromValue = fromValue;
      state.rate = rate;
      state.modeType = modeType;
      state.frequencyValue = frequencyValue;
      state.useWrappedProtocolToken = false;
    })
    .addCase(setFromValue, (state, { payload }) => {
      state.fromValue = payload;
    })
    .addCase(setRate, (state, { payload }) => {
      state.rate = payload;
    })
    .addCase(setModeType, (state, { payload }) => {
      state.modeType = payload;
    })
    .addCase(setFrequencyValue, (state, { payload }) => {
      state.frequencyValue = payload;
    })
    .addCase(setUseWrappedProtocolToken, (state, { payload }) => {
      state.useWrappedProtocolToken = payload;
    })
    .addCase(resetModifySettingsModal, () => ({
      ...initialState,
    }))
);
