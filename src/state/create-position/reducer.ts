import { createReducer } from '@reduxjs/toolkit';
import { ONE_DAY } from 'config/constants';
import { BigNumber } from 'ethers';
import { Token } from 'types';
import { setFromValue, setFrom, setTo, setFrequencyType, setFrequencyValue } from './actions';

export interface CreatePositionState {
  fromValue: string;
  frequencyType: BigNumber;
  frequencyValue: string;
  from: Token | null;
  to: Token | null;
}

const initialState: CreatePositionState = {
  fromValue: '',
  frequencyType: ONE_DAY,
  frequencyValue: '5',
  from: null,
  to: null,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setFromValue, (state, { payload }) => {
      state.fromValue = payload;
    })
    .addCase(setFrom, (state, { payload }) => {
      state.from = payload;
    })
    .addCase(setTo, (state, { payload }) => {
      state.to = payload;
    })
    .addCase(setFrequencyType, (state, { payload }) => {
      state.frequencyType = payload;
    })
    .addCase(setFrequencyValue, (state, { payload }) => {
      state.frequencyValue = payload;
    })
);
