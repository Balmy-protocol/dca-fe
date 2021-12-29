import { createReducer } from '@reduxjs/toolkit';
import { changeMainTab, changeOpenClosePositionTab } from './actions';

export interface HomeTabsState {
  mainSelector: number;
  openClosedPositions: number;
}

const initialState: HomeTabsState = {
  mainSelector: 0,
  openClosedPositions: 0,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(changeMainTab, (state, { payload }) => {
      state.mainSelector = payload;
    })
    .addCase(changeOpenClosePositionTab, (state, { payload }) => {
      state.openClosedPositions = payload;
    })
);
