import { createReducer } from '@reduxjs/toolkit';
import { SwapOption, Token } from 'types';
import { setFromValue, setFrom, setTo, setToValue, setSelectedRoute, setSorting } from './actions';

export interface AggregatorState {
  fromValue: string;
  toValue: string;
  from: Token | null;
  to: Token | null;
  isBuyOrder: boolean;
  selectedRoute: SwapOption | null;
  sorting: string;
}

const initialState: AggregatorState = {
  fromValue: '',
  toValue: '',
  from: null,
  to: null,
  isBuyOrder: false,
  selectedRoute: null,
  sorting: 'most-profit',
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
);
