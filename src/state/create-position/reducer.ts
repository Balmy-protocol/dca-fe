import { createReducer } from '@reduxjs/toolkit';
import { ONE_DAY } from 'config/constants';
import { BigNumber } from 'ethers';
import { Token, YieldOption } from 'types';
import {
  setFromValue,
  setFrom,
  setTo,
  setFrequencyType,
  setFrequencyValue,
  setYieldEnabled,
  setFromYield,
  setToYield,
} from './actions';

export interface CreatePositionState {
  fromValue: string;
  frequencyType: BigNumber;
  frequencyValue: string;
  from: Token | null;
  to: Token | null;
  yieldEnabled: boolean;
  fromYield: YieldOption | null | undefined;
  toYield: YieldOption | null | undefined;
}

const initialState: CreatePositionState = {
  fromValue: '',
  frequencyType: ONE_DAY,
  frequencyValue: '5',
  from: null,
  to: null,
  yieldEnabled: true,
  fromYield: undefined,
  toYield: undefined,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setFromValue, (state, { payload }) => {
      state.fromValue = payload;
    })
    .addCase(setFrom, (state, { payload }) => {
      state.from = payload;
      state.fromYield = undefined;
    })
    .addCase(setTo, (state, { payload }) => {
      state.to = payload;
      state.toYield = undefined;
    })
    .addCase(setFrequencyType, (state, { payload }) => {
      state.frequencyType = payload;
    })
    .addCase(setFrequencyValue, (state, { payload }) => {
      state.frequencyValue = payload;
    })
    .addCase(setYieldEnabled, (state, { payload }) => {
      state.yieldEnabled = payload;
    })
    .addCase(setFromYield, (state, { payload }) => {
      state.fromYield = payload;
    })
    .addCase(setToYield, (state, { payload }) => {
      state.toYield = payload;
    })
);
