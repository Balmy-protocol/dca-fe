import { createReducer } from '@reduxjs/toolkit';
import { SwapOption, Token } from 'types';
import { SORT_MOST_PROFIT, SwapSortOptions } from 'config/constants/aggregator';
import { DEFAULT_NETWORK_FOR_AGGREGATOR } from 'config';
import { getProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import {
  setFromValue,
  setFrom,
  setTo,
  setToValue,
  setSelectedRoute,
  setSorting,
  resetForm,
  setTransferTo,
  setAggregatorChainId,
} from './actions';

export interface AggregatorState {
  fromValue: string;
  toValue: string;
  from: Token | null;
  to: Token | null;
  isBuyOrder: boolean;
  selectedRoute: SwapOption | null;
  sorting: SwapSortOptions;
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
  sorting: SORT_MOST_PROFIT,
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
    .addCase(setSorting, (state, { payload }) => {
      state.sorting = payload;
    })
    .addCase(setTransferTo, (state, { payload }) => {
      state.transferTo = payload;
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
      state.sorting = SORT_MOST_PROFIT;
    })
);
