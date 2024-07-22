import { createReducer } from '@reduxjs/toolkit';
import { DEFAULT_NETWORK_FOR_VERSION, ModeTypesIds, ONE_DAY, POSITION_VERSION_4 } from '@constants';

import { PositionYieldOption, Token } from '@types';
import {
  setFromValue,
  setFrom,
  setTo,
  setFrequencyType,
  setFrequencyValue,
  setFromYield,
  setToYield,
  setDCAChainId,
  setRate,
  setModeType,
  resetDcaForm,
} from './actions';

export interface CreatePositionState {
  fromValue: string;
  rate: string;
  frequencyType: bigint;
  frequencyValue: string;
  from: Token | null;
  to: Token | null;
  fromYield: PositionYieldOption | null;
  toYield: PositionYieldOption | null;
  userHasChangedYieldOption: boolean;
  chainId: number;
  modeType: ModeTypesIds;
}

export const initialState: CreatePositionState = {
  fromValue: '',
  frequencyType: ONE_DAY,
  frequencyValue: '7',
  modeType: ModeTypesIds.FULL_DEPOSIT_TYPE,
  rate: '',
  from: null,
  to: null,
  fromYield: null,
  toYield: null,
  userHasChangedYieldOption: false,
  chainId: DEFAULT_NETWORK_FOR_VERSION[POSITION_VERSION_4].chainId,
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(setFromValue, (state, { payload }) => {
      state.fromValue = payload;
    })
    .addCase(setFrom, (state, { payload }) => {
      state.from = payload;
      state.fromYield = null;
      state.userHasChangedYieldOption = false;
    })
    .addCase(setTo, (state, { payload }) => {
      state.to = payload;
      state.toYield = null;
    })
    .addCase(setFrequencyType, (state, { payload }) => {
      state.frequencyType = payload;
    })
    .addCase(setFrequencyValue, (state, { payload }) => {
      state.frequencyValue = payload;
    })
    .addCase(setFromYield, (state, { payload: { option, manualUpdate } }) => {
      state.fromYield = option;
      state.userHasChangedYieldOption = manualUpdate;
    })
    .addCase(setToYield, (state, { payload: { option, manualUpdate } }) => {
      state.toYield = option;
      state.userHasChangedYieldOption = manualUpdate;
    })
    .addCase(setRate, (state, { payload }) => {
      state.rate = payload;
    })
    .addCase(setModeType, (state, { payload }) => {
      state.modeType = payload;
    })
    .addCase(setDCAChainId, (state, { payload }) => {
      state.chainId = payload;
      state.fromValue = '';
      state.frequencyType = ONE_DAY;
      state.frequencyValue = '7';
      state.to = null;
      state.fromYield = null;
      state.toYield = null;
      state.userHasChangedYieldOption = false;
    })
    .addCase(resetDcaForm, (state) => {
      state.fromValue = '';
      state.frequencyType = ONE_DAY;
      state.frequencyValue = '7';
      state.from = null;
      state.to = null;
      state.fromYield = null;
      state.toYield = null;
      state.userHasChangedYieldOption = false;
    });
});
