import { createReducer } from '@reduxjs/toolkit';
import { updateBadgeNumber } from './actions';
import { clearAllTransactions } from '../transactions/actions';

export interface BadgeState {
  readonly viewedTransactions: number;
}

const initialState: BadgeState = {
  viewedTransactions: 0,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateBadgeNumber, (state, action) => {
      const { viewedTransactions } = action.payload;
      state.viewedTransactions = viewedTransactions;
    })
    .addCase(clearAllTransactions, (state) => {
      state.viewedTransactions = 0;
    })
);
