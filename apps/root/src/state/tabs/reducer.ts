import { createReducer } from '@reduxjs/toolkit';
import { changeRoute, changeOpenClosePositionTab } from './actions';

export interface HomeTabsState {
  currentRoute: string;
  prevRoute: string;
  openClosedPositions: number;
}

export const initialState: HomeTabsState = {
  currentRoute: 'home',
  prevRoute: 'home',
  openClosedPositions: 0,
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(changeRoute, (state, { payload }) => {
      state.prevRoute = state.currentRoute;
      state.currentRoute = payload;
    })
    .addCase(changeOpenClosePositionTab, (state, { payload }) => {
      state.openClosedPositions = payload;
    });
});
