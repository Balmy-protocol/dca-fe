import { createReducer } from '@reduxjs/toolkit';
import { changeRoute, changeOpenClosePositionTab } from './actions';

export interface HomeTabsState {
  currentRoute: string;
  openClosedPositions: number;
}

const initialState: HomeTabsState = {
  currentRoute: 'home',
  openClosedPositions: 0,
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(changeRoute, (state, { payload }) => {
      state.currentRoute = payload;
    })
    .addCase(changeOpenClosePositionTab, (state, { payload }) => {
      state.openClosedPositions = payload;
    });
});
