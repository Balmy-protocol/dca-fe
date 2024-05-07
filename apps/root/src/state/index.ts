import { configureStore } from '@reduxjs/toolkit';
import { save, load } from 'redux-localstorage-simple';
import { SupportedLanguages } from '@constants/lang';
import { DEFAULT_AGGREGATOR_SETTINGS } from '@constants/aggregator';
import { axiosClient } from './axios';
import transactions from './transactions/reducer';
import badge from './transactions-badge/reducer';
import createPosition from './create-position/reducer';
import aggregator from './aggregator/reducer';
import aggregatorSettings from './aggregator-settings/reducer';
import initializer from './initializer/reducer';
import modifyRateSettings from './modify-rate-settings/reducer';
import positionDetails from './position-details/reducer';
import eulerClaim from './euler-claim/reducer';
import balances from './balances/reducer';
import positionPermissions from './position-permissions/reducer';
import tabs from './tabs/reducer';
import tokenLists, { getDefaultByUrl } from './token-lists/reducer';
import config from './config/reducer';
import error from './error/reducer';
import transfer from './transfer/reducer';
import Web3Service from '@services/web3Service';
import { AxiosInstance } from 'axios';
import { LATEST_SIGNATURE_VERSION, LATEST_SIGNATURE_VERSION_KEY, WALLET_SIGNATURE_KEY } from '@services/accountService';

const LATEST_VERSION = '1.0.8';
const LATEST_AGGREGATOR_SETTINGS_VERSION = '1.0.10';
const LATEST_TRANSACTION_VERSION = '1.0.1';
const TRANSACTION_VERSION_KEY = 'transactions_version';
const TRANSACTION_KEY = 'redux_localstorage_simple_transactions';
const BADGE_KEY = 'redux_localstorage_simple_badge';
const POSITION_DETAILS_KEY = 'redux_localstorage_simple_positionDetails';
const AGGREGATOR_SETTINGS_KEY = 'redux_localstorage_simple_aggregatorSettings';
const AGGREGATOR_SETTINGS_VERSION_KEY = 'mean_aggregator_settings_version';
const MEAN_UI_VERSION_KEY = 'mean_ui_version';

function checkStorageValidity() {
  const meanUIVersion = localStorage.getItem(MEAN_UI_VERSION_KEY);
  const aggregatorSettingsVersion = localStorage.getItem(AGGREGATOR_SETTINGS_VERSION_KEY);
  const transactionVersion = localStorage.getItem(TRANSACTION_VERSION_KEY);
  const signatureVersion = localStorage.getItem(LATEST_SIGNATURE_VERSION_KEY);

  if (transactionVersion !== LATEST_TRANSACTION_VERSION) {
    console.warn('different transaction version detected, clearing transaction storage');
    localStorage.setItem(TRANSACTION_VERSION_KEY, LATEST_TRANSACTION_VERSION);
    localStorage.removeItem(TRANSACTION_KEY);
    localStorage.removeItem(POSITION_DETAILS_KEY);
    localStorage.removeItem(BADGE_KEY);
  }

  const currentTransactions = localStorage.getItem(TRANSACTION_KEY);
  const currentTransactionVersion = localStorage.getItem(TRANSACTION_VERSION_KEY);

  if (meanUIVersion !== LATEST_VERSION) {
    console.warn('different version detected, clearing storage');
    localStorage.clear();
    localStorage.setItem(MEAN_UI_VERSION_KEY, LATEST_VERSION);
    if (currentTransactionVersion) {
      localStorage.setItem(TRANSACTION_VERSION_KEY, currentTransactionVersion);
    }
    if (currentTransactions) {
      localStorage.setItem(TRANSACTION_KEY, currentTransactions);
    }
  }

  if (aggregatorSettingsVersion !== LATEST_AGGREGATOR_SETTINGS_VERSION) {
    console.warn('different aggregator settings version detected, clearing storage');

    localStorage.setItem(AGGREGATOR_SETTINGS_VERSION_KEY, LATEST_AGGREGATOR_SETTINGS_VERSION);
    localStorage.removeItem(AGGREGATOR_SETTINGS_KEY);
  }

  if (signatureVersion !== LATEST_SIGNATURE_VERSION) {
    console.warn('different wallet auth signature version detected, clearing storage');
    localStorage.setItem(LATEST_SIGNATURE_VERSION_KEY, LATEST_SIGNATURE_VERSION);
    localStorage.removeItem(WALLET_SIGNATURE_KEY);
  }
}

checkStorageValidity();

const PERSISTED_STATES: string[] = [
  'transactions',
  'badge',
  'positionDetails.showBreakdown',
  'aggregatorSettings',
  'tokenLists.customTokens',
  'config.selectedLocale',
  'config.theme',
  'eulerClaim',
];

export interface ExtraArgument {
  axiosClient: AxiosInstance;
  web3Service: Web3Service;
}

const createStore = (web3Service: Web3Service) =>
  configureStore({
    reducer: {
      transactions,
      initializer,
      badge,
      tokenLists,
      createPosition,
      aggregator,
      config,
      tabs,
      positionPermissions,
      modifyRateSettings,
      error,
      positionDetails,
      aggregatorSettings,
      eulerClaim,
      transfer,
      balances,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: { extraArgument: { web3Service, axiosClient } },
        serializableCheck: false,
      }).concat([save({ states: PERSISTED_STATES, debounce: 1000 })]),
    preloadedState: load({
      states: PERSISTED_STATES,
      preloadedState: {
        aggregatorSettings: {
          gasSpeed: DEFAULT_AGGREGATOR_SETTINGS.gasSpeed,
          slippage: DEFAULT_AGGREGATOR_SETTINGS.slippage.toString(),
          disabledDexes: DEFAULT_AGGREGATOR_SETTINGS.disabledDexes,
          showTransactionCost: DEFAULT_AGGREGATOR_SETTINGS.showTransactionCost,
          confettiParticleCount: DEFAULT_AGGREGATOR_SETTINGS.confetti,
          sorting: DEFAULT_AGGREGATOR_SETTINGS.sorting,
          isPermit2Enabled: DEFAULT_AGGREGATOR_SETTINGS.isPermit2Enabled,
          sourceTimeout: DEFAULT_AGGREGATOR_SETTINGS.sourceTimeout,
        },
        eulerClaim: {
          signature: '',
        },
        config: {
          network: undefined,
          theme: 'light',
          selectedLocale: SupportedLanguages.english,
          hideSmallBalances: true,
        },
        positionDetails: {
          position: null,
          showBreakdown: false,
        },
        tokenLists: {
          activeAllTokenLists: [
            // General
            'https://raw.githubusercontent.com/Mean-Finance/token-lister/main/token-list-complete.json',
            // Custom tokens
            'custom-tokens',
          ],
          byUrl: getDefaultByUrl(),
          hasLoaded: false,
          customTokens: {
            name: 'custom-tokens',
            logoURI: '',
            timestamp: new Date().getTime(),
            tokens: [],
            version: { major: 0, minor: 0, patch: 0 },
            hasLoaded: true,
            requestId: '',
            fetchable: true,
          },
        },
      },
    }),
  });

export default createStore;

export type StoreType = ReturnType<typeof createStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<StoreType['getState']>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = StoreType['dispatch'];
