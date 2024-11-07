import { TokenListId } from 'common-types';
import { initialState as aggregatorSettingsInitialState } from './aggregator-settings/reducer';
import { initialState as configInitialState } from './config/reducer';

export interface SavedCustomConfig {
  aggregatorSettings: typeof aggregatorSettingsInitialState;
  customTokens: TokenListId[];
  config: {
    selectedLocale: typeof configInitialState.selectedLocale;
    theme: typeof configInitialState.theme;
    showSmallBalances: typeof configInitialState.showSmallBalances;
    showBalances: typeof configInitialState.showBalances;
    switchActiveWalletOnConnection: typeof configInitialState.switchActiveWalletOnConnection;
    useUnlimitedApproval: typeof configInitialState.useUnlimitedApproval;
  };
}
