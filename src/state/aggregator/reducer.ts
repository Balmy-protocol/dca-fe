import { createReducer } from '@reduxjs/toolkit';
import { SwapOption, Token } from '@types';
import { DEFAULT_NETWORK_FOR_AGGREGATOR } from '@constants';
import { getProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import {
  setFromValue,
  setFrom,
  setTo,
  setToValue,
  setSelectedRoute,
  resetForm,
  setTransferTo,
  setAggregatorChainId,
  toggleFromTo,
} from './actions';

export interface AggregatorState {
  fromValue: string;
  toValue: string;
  from: Token | null;
  to: Token | null;
  isBuyOrder: boolean;
  selectedRoute: SwapOption | null;
  transferTo: null | string;
  network: number;
}

const initialState: AggregatorState = {
  fromValue: '',
  toValue: '',
  from: null,
  to: null,
  isBuyOrder: false,
  selectedRoute: null,
  transferTo: null,
  network: DEFAULT_NETWORK_FOR_AGGREGATOR.chainId,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setFromValue, (state, { payload: { value, updateMode } }) => {
      state.fromValue = value;
      if (updateMode) {
        state.isBuyOrder = false;
      }
    })
    .addCase(setToValue, (state, { payload: { value, updateMode } }) => {
      state.toValue = value;
      if (updateMode) {
        state.isBuyOrder = true;
      }
    })
    .addCase(setFrom, (state, { payload }) => {
      state.from = payload;
    })
    .addCase(setTo, (state, { payload }) => {
      state.to = payload;
    })
    .addCase(setSelectedRoute, (state, { payload }) => {
      state.selectedRoute = payload;
    })
    .addCase(setTransferTo, (state, { payload }) => {
      state.transferTo = payload;
    })
    .addCase(toggleFromTo, (state) => {
      const oldFromValue = state.fromValue;
      state.fromValue = state.toValue;
      state.toValue = oldFromValue;

      const oldFrom = state.from;
      state.from = state.to;
      state.to = oldFrom;

      state.isBuyOrder = !state.isBuyOrder;
    })
    .addCase(setAggregatorChainId, (state, { payload }) => {
      state.network = payload;
      state.to = state.to?.address === PROTOCOL_TOKEN_ADDRESS ? getProtocolToken(payload) : null;
      state.from = state.from?.address === PROTOCOL_TOKEN_ADDRESS ? getProtocolToken(payload) : null;
      state.fromValue = '';
      state.toValue = '';
      state.transferTo = null;
      state.selectedRoute = null;
    })
    .addCase(resetForm, (state) => {
      state.fromValue = '';
      state.toValue = '';
      state.transferTo = null;
      state.selectedRoute = null;
    })
);
