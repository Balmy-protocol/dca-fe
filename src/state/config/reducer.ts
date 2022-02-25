import { createReducer } from '@reduxjs/toolkit';
import { setNetwork, toggleTheme } from './actions';

export interface ApplicationState {
  readonly theme: 'light' | 'dark';
  network: { chainId: number, name: string } | undefined
}

const initialState: ApplicationState = {
  theme: 'dark',
  network: undefined,
};

export default createReducer(initialState, (builder) =>
  builder.addCase(toggleTheme, (state) => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
  })
  .addCase(setNetwork, (state, { payload }) => {
    state.network = payload;
  })
);
