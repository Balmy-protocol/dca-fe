import { createReducer } from '@reduxjs/toolkit';
import { toggleTheme } from './actions';

export interface ApplicationState {
  readonly theme: 'light' | 'dark';
}

const initialState: ApplicationState = {
  theme: 'dark',
};

export default createReducer(initialState, (builder) =>
  builder.addCase(toggleTheme, (state) => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
  })
);
