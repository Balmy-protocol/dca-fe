import { createReducer } from '@reduxjs/toolkit';
import { SupportedLanguages } from '@constants/lang';
import { setNetwork, toggleTheme, setSelectedLocale, toggleShowSmallBalances, toggleShowBalances } from './actions';

export interface ApplicationState {
  readonly theme: 'light' | 'dark';
  network: { chainId: number; name: string } | undefined;
  selectedLocale: SupportedLanguages;
  showSmallBalances: boolean;
  showBalances: boolean;
}

export const initialState: ApplicationState = {
  theme: 'light',
  network: undefined,
  selectedLocale: SupportedLanguages.english,
  showSmallBalances: true,
  showBalances: true,
};

export default createReducer(initialState, (builder) => {
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
    .addCase(toggleShowSmallBalances, (state) => {
      state.showSmallBalances = !state.showSmallBalances;
    })
    .addCase(toggleShowBalances, (state) => {
      state.showBalances = !state.showBalances;
    });
});
