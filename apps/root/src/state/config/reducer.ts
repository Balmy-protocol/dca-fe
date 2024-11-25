import { createReducer } from '@reduxjs/toolkit';
import { SupportedLanguages } from '@constants/lang';
import {
  setNetwork,
  toggleTheme,
  setSelectedLocale,
  toggleShowSmallBalances,
  toggleShowBalances,
  hydrateConfig,
  setSwitchActiveWalletOnConnection,
  setUseUnlimitedApproval,
} from './actions';
import { isUndefined } from 'lodash';

export interface ApplicationState {
  readonly theme: 'light' | 'dark';
  network: { chainId: number; name: string } | undefined;
  selectedLocale: SupportedLanguages;
  showSmallBalances: boolean;
  showBalances: boolean;
  switchActiveWalletOnConnection: boolean;
  useUnlimitedApproval: boolean;
}

export const initialState: ApplicationState = {
  theme: 'light',
  network: undefined,
  selectedLocale: SupportedLanguages.english,
  showSmallBalances: true,
  showBalances: true,
  switchActiveWalletOnConnection: true,
  useUnlimitedApproval: true,
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
    .addCase(setUseUnlimitedApproval, (state, { payload }) => {
      state.useUnlimitedApproval = payload;
    })
    .addCase(toggleShowSmallBalances, (state) => {
      state.showSmallBalances = !state.showSmallBalances;
    })
    .addCase(toggleShowBalances, (state) => {
      state.showBalances = !state.showBalances;
    })
    .addCase(setSwitchActiveWalletOnConnection, (state, { payload }) => {
      state.switchActiveWalletOnConnection = payload;
    })
    .addCase(hydrateConfig, (state, { payload }) => {
      if (!isUndefined(payload.selectedLocale)) {
        state.selectedLocale = payload.selectedLocale;
      }
      if (!isUndefined(payload.showBalances)) {
        state.showBalances = payload.showBalances;
      }
      if (!isUndefined(payload.showSmallBalances)) {
        state.showSmallBalances = payload.showSmallBalances;
      }
      if (!isUndefined(payload.theme)) {
        state.theme = payload.theme;
      }
      if (!isUndefined(payload.switchActiveWalletOnConnection)) {
        state.switchActiveWalletOnConnection = payload.switchActiveWalletOnConnection;
      }
      if (!isUndefined(payload.useUnlimitedApproval)) {
        state.useUnlimitedApproval = payload.useUnlimitedApproval;
      }
    });
});
