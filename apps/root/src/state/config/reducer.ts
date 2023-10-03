import { createReducer } from '@reduxjs/toolkit';
import { SupportedLanguages } from '@constants/lang';
import { setNetwork, toggleTheme, setSelectedLocale } from './actions';

export interface ApplicationState {
  readonly theme: 'light' | 'dark';
  network: { chainId: number; name: string } | undefined;
  selectedLocale: SupportedLanguages;
}

const initialState: ApplicationState = {
  theme: 'dark',
  network: undefined,
  selectedLocale: SupportedLanguages.english,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(toggleTheme, (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    })
    .addCase(setNetwork, (state, { payload }) => {
      state.network = payload;
    })
    .addCase(setSelectedLocale, (state, { payload }) => {
      state.selectedLocale = payload;
    })
);
