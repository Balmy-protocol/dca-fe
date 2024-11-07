import { createAction } from '@reduxjs/toolkit';
import { SupportedLanguages } from '@constants/lang';
import { createAppAsyncThunk } from '@state/createAppAsyncThunk';
import { SavedCustomConfig } from '@state/base-types';
import { hydrateAggregatorSettings } from '@state/aggregator-settings/actions';
import { hydrateCustomTokens } from '@state/token-lists/actions';
import { RootState } from '@state/hooks';
import { TokenListId } from 'common-types';
import { pick } from 'lodash';

export const toggleTheme = createAction('application/toggleTheme');
export const setNetwork = createAction<{ chainId: number; name: string }>('application/setNetwork');
export const setSelectedLocale = createAction<SupportedLanguages>('application/setSelectedLocale');
export const toggleShowSmallBalances = createAction('application/toggleShowSmallBalances');
export const toggleShowBalances = createAction('application/toggleShowBalances');
export const hydrateConfig = createAction<Partial<SavedCustomConfig['config']>>('application/hydrateConfig');
export const setSwitchActiveWalletOnConnection = createAction<boolean>('application/setSwitchActiveWalletOnConnection');
export const setUseUnlimitedApproval = createAction<boolean>('application/setUseUnlimitedApproval');

export const SAVED_ACTIONS = [
  toggleTheme.type,
  setSelectedLocale.type,
  toggleShowSmallBalances.type,
  toggleShowBalances.type,
  setSwitchActiveWalletOnConnection.type,
  setUseUnlimitedApproval.type,
];

export const parseStateToConfig = (state: RootState) => {
  const { aggregatorSettings, config, tokenLists } = state;

  return {
    aggregatorSettings,
    config: pick(config, [
      'selectedLocale',
      'theme',
      'showSmallBalances',
      'showBalances',
      'switchActiveWalletOnConnection',
      'useUnlimitedApproval',
    ]),
    customTokens: Object.values(tokenLists.customTokens.tokens).map<TokenListId>(
      ({ chainId, address }) => `${chainId}-${address}` as TokenListId
    ),
  };
};
export const setSwitchActiveWalletOnConnectionThunk = createAppAsyncThunk<void, boolean>(
  'config/setSwitchActiveWalletOnConnectionThunk',
  (switchActiveWalletOnConnection, { dispatch, extra: { web3Service } }) => {
    const accountService = web3Service.getAccountService();

    accountService.setSwitchActiveWalletOnConnection(switchActiveWalletOnConnection);
    dispatch(setSwitchActiveWalletOnConnection(switchActiveWalletOnConnection));
  }
);

export const hydrateStoreFromSavedConfig = createAppAsyncThunk<void, Partial<SavedCustomConfig>>(
  'config/hydrateStoreFromSavedConfig',
  (config, { dispatch, getState, extra: { web3Service } }) => {
    if (config.config) {
      dispatch(hydrateConfig(config.config));
    }

    if (config.aggregatorSettings) {
      dispatch(hydrateAggregatorSettings(config.aggregatorSettings));
    }

    if (config.customTokens) {
      void dispatch(hydrateCustomTokens(config.customTokens));
    }

    const accountService = web3Service.getAccountService();

    const state = getState();

    void accountService.updateUserConfig(parseStateToConfig(state));
  }
);
