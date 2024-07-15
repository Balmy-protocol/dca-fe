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

export const SAVED_ACTIONS = [
  toggleTheme.type,
  setSelectedLocale.type,
  toggleShowSmallBalances.type,
  toggleShowBalances.type,
];

export const parseStateToConfig = (state: RootState) => {
  const { aggregatorSettings, config, tokenLists } = state;

  return {
    aggregatorSettings,
    config: pick(config, ['selectedLocale', 'theme', 'showSmallBalances', 'showBalances']),
    customTokens: Object.values(tokenLists.customTokens.tokens).map<TokenListId>(
      ({ chainId, address }) => `${chainId}-${address}` as TokenListId
    ),
  };
};

export const hydrateStoreFromSavedConfig = createAppAsyncThunk<void, Partial<SavedCustomConfig>>(
  'config/hydrateStoreFromSavedConfig',
  (config, { dispatch, getState, extra: { web3Service } }) => {
    if (config.config) {
      console.log('updating config');
      dispatch(hydrateConfig(config.config));
    }

    if (config.aggregatorSettings) {
      console.log('updating aggregatorSettings');
      dispatch(hydrateAggregatorSettings(config.aggregatorSettings));
    }

    if (config.customTokens) {
      console.log('updating customTokens');
      void dispatch(hydrateCustomTokens(config.customTokens));
    }

    const accountService = web3Service.getAccountService();

    const state = getState();

    void accountService.updateUserConfig(parseStateToConfig(state));
  }
);
