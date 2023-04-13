import { createReducer } from '@reduxjs/toolkit';
import { setEulerSignature } from './actions';

export interface EulerClaimState {
  signature: string;
}

const initialState: EulerClaimState = {
  signature: '',
};

export default createReducer(initialState, (builder) =>
  builder.addCase(setEulerSignature, (state, { payload }) => {
    state.signature = payload;
  })
);
