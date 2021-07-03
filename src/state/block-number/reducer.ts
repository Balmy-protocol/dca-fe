import { createReducer, nanoid } from '@reduxjs/toolkit';
import { updateBlockNumber } from './actions';

export interface ApplicationState {
  readonly blockNumber: number | null;
}

const initialState: ApplicationState = {
  blockNumber: null,
};

export default createReducer(initialState, (builder) =>
  builder.addCase(updateBlockNumber, (state, action) => {
    const { blockNumber } = action.payload;
    state.blockNumber = blockNumber;
  })
);
