import { createReducer } from '@reduxjs/toolkit';
import { DEFAULT_NETWORK_FOR_VERSION, ONE_DAY, POSITION_VERSION_4 } from 'config/constants';
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
  setDCAChainId,
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
  chainId: number;
}

const initialState: CreatePositionState = {
  fromValue: '',
  frequencyType: ONE_DAY,
  frequencyValue: '7',
  from: null,
  to: null,
  yieldEnabled: true,
  fromYield: undefined,
  toYield: undefined,
  chainId: DEFAULT_NETWORK_FOR_VERSION[POSITION_VERSION_4].chainId,
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
    .addCase(setDCAChainId, (state, { payload }) => {
      state.chainId = payload;
      state.fromValue = '';
      state.frequencyType = ONE_DAY;
      state.frequencyValue = '7';
      state.from = null;
      state.to = null;
      state.yieldEnabled = true;
      state.fromYield = undefined;
      state.toYield = undefined;
    })
);
