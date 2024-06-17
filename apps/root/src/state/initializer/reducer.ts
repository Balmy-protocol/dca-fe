import { createReducer } from '@reduxjs/toolkit';
import { setInitialized } from './actions';

export interface ApplicationState {
  readonly hasInitialized: boolean;
}

const initialState: ApplicationState = {
  hasInitialized: false,
};

export default createReducer(initialState, (builder) => {
  builder.addCase(setInitialized, (state) => {
    state.hasInitialized = true;
  });
});
