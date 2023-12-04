import { createReducer } from '@reduxjs/toolkit';
import { setError } from './actions';

export interface ApplicationState {
  errorMessage: string | null;
  errorName: string | null;
  errorStackTrace?: string | null;
  hasError: boolean;
}

const initialState: ApplicationState = {
  errorMessage: null,
  errorName: null,
  errorStackTrace: null,
  hasError: false,
};

export default createReducer(initialState, (builder) => {
  builder.addCase(setError, (state, { payload }) => {
    if (payload && payload.error) {
      state.errorMessage = payload.error.message;
      state.errorName = payload.error.name;
      state.errorStackTrace = payload.error.stack;
      state.hasError = true;
    } else {
      state.errorMessage = null;
      state.errorName = null;
      state.errorStackTrace = null;
      state.hasError = false;
    }
  });
});
