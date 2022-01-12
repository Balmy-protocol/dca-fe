import { createReducer } from '@reduxjs/toolkit';
import { changeMainTab, changeOpenClosePositionTab, changePositionDetailsTab } from './actions';

export interface HomeTabsState {
  mainSelector: number;
  openClosedPositions: number;
  positionDetailsSelector: number;
}

const initialState: HomeTabsState = {
  mainSelector: 0,
  openClosedPositions: 0,
  positionDetailsSelector: 0,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(changeMainTab, (state, { payload }) => {
      state.mainSelector = payload;
    })
    .addCase(changeOpenClosePositionTab, (state, { payload }) => {
      state.openClosedPositions = payload;
    })
    .addCase(changePositionDetailsTab, (state, { payload }) => {
      state.positionDetailsSelector = payload;
    })
);
