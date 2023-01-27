import { configureStore } from '@reduxjs/toolkit';
import { save, load } from 'redux-localstorage-simple';
import { setupCache, setup } from 'axios-cache-adapter';
import axios from 'axios';

import blockNumber from './block-number/reducer';
import transactions from './transactions/reducer';
import badge from './transactions-badge/reducer';
import createPosition from './create-position/reducer';
import initializer from './initializer/reducer';
import modifyRateSettings from './modify-rate-settings/reducer';
import positionDetails from './position-details/reducer';
import positionPermissions from './position-permissions/reducer';
import tabs from './tabs/reducer';
import tokenLists, { getDefaultByUrl } from './token-lists/reducer';
import config from './config/reducer';
import error from './error/reducer';

const LATEST_VERSION = '1.0.4';
const LATEST_TRANSACTION_VERSION = '1.0.0';
const TRANSACTION_VERSION_KEY = 'transactions_version';
const TRANSACTION_KEY = 'redux_localstorage_simple_transactions';
const BADGE_KEY = 'redux_localstorage_simple_badge';
const POSITION_DETAILS_KEY = 'redux_localstorage_simple_positionDetails';
const MEAN_UI_VERSION_KEY = 'mean_ui_version';

function checkStorageValidity() {
  const meanUIVersion = localStorage.getItem(MEAN_UI_VERSION_KEY);
  const transactionVersion = localStorage.getItem(TRANSACTION_VERSION_KEY);

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
}

checkStorageValidity();

// this should not be here
// Create `axios-cache-adapter` instance
const cache = setupCache({
  maxAge: 15 * 60 * 1000,
});

// Create `axios` instance passing the newly created `cache.adapter`
export const axiosClient = axios.create({
  adapter: cache.adapter,
});

export const setupAxiosClient = () =>
  setup({
    cache: {
      maxAge: 15 * 60 * 1000,
      exclude: {
        query: false,
        methods: ['put', 'patch', 'delete'],
      },
    },
  });

const PERSISTED_STATES: string[] = ['transactions', 'badge', 'positionDetails.showBreakdown', 'config.selectedLocale'];

const store = configureStore({
  reducer: {
    transactions,
    blockNumber,
    initializer,
    badge,
    tokenLists,
    createPosition,
    config,
    tabs,
    positionPermissions,
    modifyRateSettings,
    error,
    positionDetails,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: { extraArgument: axiosClient }, serializableCheck: false }).concat([
      save({ states: PERSISTED_STATES, debounce: 1000 }),
    ]),
  preloadedState: load({
    states: PERSISTED_STATES,
    preloadedState: {
      config: {
        network: undefined,
        theme: 'dark',
      },
      positionDetails: {
        position: null,
      },
      tokenLists: {
        byUrl: getDefaultByUrl(),
        activeLists: ['https://raw.githubusercontent.com/Mean-Finance/token-list/main/mean-finance.tokenlist.json'],
      },
    },
  }),
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
