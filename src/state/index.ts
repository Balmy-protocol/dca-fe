import { configureStore } from '@reduxjs/toolkit';
import { save, load } from 'redux-localstorage-simple';
import { setupCache, setup } from 'axios-cache-adapter';
import axios from 'axios';
import { SupportedLanguages } from 'config/constants/lang';

import blockNumber from './block-number/reducer';
import transactions from './transactions/reducer';
import badge from './transactions-badge/reducer';
import createPosition from './create-position/reducer';
import aggregator from './aggregator/reducer';
import aggregatorSettings from './aggregator-settings/reducer';
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

const PERSISTED_STATES: string[] = [
  'transactions',
  'badge',
  'positionDetails.showBreakdown',
  'aggregatorSettings',
  'tokenLists.customTokens',
  'config.selectedLocale',
];

const store = configureStore({
  reducer: {
    transactions,
    blockNumber,
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
        selectedLocale: SupportedLanguages.english,
      },
      positionDetails: {
        position: null,
      },
      tokenLists: {
        activeLists: ['Mean Finance Graph Allowed Tokens'],
        activeAggregatorLists: [
          'https://raw.githubusercontent.com/Mean-Finance/token-list/main/mean-finance.tokenlist.json',
          'tokens.1inch.eth',
          'https://tokens.1inch.io/v1.1/56',
          'https://tokens.1inch.io/v1.1/250',
          'https://tokens.1inch.io/v1.1/43114',
          'https://tokens.1inch.io/v1.1/42161',
          'https://swap.crodex.app/tokens.json',
          'https://ks-setting.kyberswap.com/api/v1/tokens?chainIds=42262&isWhitelisted=true&pageSize=100&page=1',
          'https://raw.githubusercontent.com/cronaswap/default-token-list/main/assets/tokens/cronos.json',
          'https://ks-setting.kyberswap.com/api/v1/tokens?chainIds=1313161554&isWhitelisted=true&pageSize=100&page=1',
          'https://raw.githubusercontent.com/wagyuswapapp/wagyu-frontend/wagyu/src/config/constants/tokenLists/pancake-default.tokenlist.json',
          'https://token-list.sushi.com/',
          'https://tokens.1inch.io/v1.1/100',
          'https://raw.githubusercontent.com/BeamSwap/beamswap-tokenlist/main/tokenlist.json',
          // 'https://extendedtokens.uniswap.org',
          'https://celo-org.github.io/celo-token-list/celo.tokenlist.json',
          'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
          'https://tokens.1inch.io/v1.1/8217',
          'https://tokens.1inch.io/v1.1/1313161554',
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

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
