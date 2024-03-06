import { createReducer } from '@reduxjs/toolkit';
import { DEFAULT_NETWORK_FOR_VERSION, ModeTypesIds, ONE_DAY, POSITION_VERSION_4 } from '@constants';

import { Token, YieldOption } from '@types';
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
} from './actions';

export interface CreatePositionState {
  fromValue: string;
  rate: string;
  frequencyType: bigint;
  frequencyValue: string;
  from: Token | null;
  to: Token | null;
  fromYield: YieldOption | null;
  toYield: YieldOption | null;
  chainId: number;
  modeType: ModeTypesIds;
}

const initialState: CreatePositionState = {
  fromValue: '',
  frequencyType: ONE_DAY,
  frequencyValue: '',
  modeType: ModeTypesIds.FULL_DEPOSIT_TYPE,
  rate: '',
  from: null,
  to: null,
  fromYield: null,
  toYield: null,
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
    .addCase(setFromYield, (state, { payload }) => {
      state.fromYield = payload;
    })
    .addCase(setToYield, (state, { payload }) => {
      state.toYield = payload;
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
      state.frequencyValue = '';
      state.from = null;
      state.to = null;
      state.fromYield = null;
      state.toYield = null;
    });
});
