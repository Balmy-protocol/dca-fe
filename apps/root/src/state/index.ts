import { configureStore } from '@reduxjs/toolkit';
import { save, load } from './utils/persistor';
import { axiosClient } from './axios';
import transactions, { initialState as transactionsInitialState } from './transactions/reducer';
import createPosition, { initialState as createPositionInitialState } from './create-position/reducer';
import aggregator, { initialState as aggregatorInitialState } from './aggregator/reducer';
import aggregatorSettings, { initialState as aggregatorSettingsInitialState } from './aggregator-settings/reducer';
import initializer, { initialState as initializerInitialState } from './initializer/reducer';
import modifyRateSettings, { initialState as modifyRateSettingsInitialState } from './modify-rate-settings/reducer';
import positionDetails, { initialState as positionDetailsInitialState } from './position-details/reducer';
import balances, { initialState as balancesInitialState } from './balances/reducer';
import positionPermissions, { initialState as positionPermissionsInitialState } from './position-permissions/reducer';
import tabs, { initialState as tabsInitialState } from './tabs/reducer';
import tokenLists, { initialState as tokenListsInitialState } from './token-lists/reducer';
import config, { initialState as configInitialState } from './config/reducer';
import error, { initialState as errorInitialState } from './error/reducer';
import transfer, { initialState as transferInitialState } from './transfer/reducer';
import allStrategiesFilters, {
  initialState as allStrategiesFiltersInitialState,
} from './all-strategies-filters/reducer';
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
  'aggregatorSettings',
  'tokenLists.customTokens',
  'config.selectedLocale',
  'config.theme',
  'config.showSmallBalances',
  'config.showBalances',
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
      transfer,
      balances,
      allStrategiesFilters,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: { extraArgument: { web3Service, axiosClient } },
        serializableCheck: false,
      }).concat([save({ states: PERSISTED_STATES, debounce: 1000 })]),
    preloadedState: load({
      states: PERSISTED_STATES,
      preloadedState: {
        transactions: transactionsInitialState,
        createPosition: createPositionInitialState,
        aggregator: aggregatorInitialState,
        aggregatorSettings: aggregatorSettingsInitialState,
        initializer: initializerInitialState,
        modifyRateSettings: modifyRateSettingsInitialState,
        positionDetails: positionDetailsInitialState,
        balances: balancesInitialState,
        positionPermissions: positionPermissionsInitialState,
        tabs: tabsInitialState,
        tokenLists: tokenListsInitialState,
        config: configInitialState,
        error: errorInitialState,
        transfer: transferInitialState,
        allStrategiesFilters: allStrategiesFiltersInitialState,
      },
    }),
  });

export default createStore;

export type StoreType = ReturnType<typeof createStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<StoreType['getState']>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = StoreType['dispatch'];
