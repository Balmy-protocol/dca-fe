import { configureStore } from '@reduxjs/toolkit';
import { save, load } from 'redux-localstorage-simple';
import { setupCache } from 'axios-cache-adapter';
import axios from 'axios';

import blockNumber from './block-number/reducer';
import transactions from './transactions/reducer';
import badge from './transactions-badge/reducer';
import createPosition from './create-position/reducer';
import initializer from './initializer/reducer';
import positionPermissions from './position-permissions/reducer';
import tabs from './tabs/reducer';
import tokenLists, { getDefaultByUrl } from './token-lists/reducer';
import config from './config/reducer';

// this should not be here
// Create `axios-cache-adapter` instance
const cache = setupCache({
  maxAge: 15 * 60 * 1000,
});

// Create `axios` instance passing the newly created `cache.adapter`
export const axiosClient = axios.create({
  adapter: cache.adapter,
});

const PERSISTED_STATES: string[] = ['transactions', 'badge', 'tokenLists.activeLists', 'config'];

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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: { extraArgument: axiosClient }, serializableCheck: false }).concat([
      save({ states: PERSISTED_STATES, debounce: 1000 }),
    ]),
  preloadedState: load({
    states: PERSISTED_STATES,
    preloadedState: {
      tokenLists: {
        byUrl: getDefaultByUrl(),
        activeLists: [
          'https://raw.githubusercontent.com/Mean-Finance/token-list/main/mean-finance.tokenlist.json',
          'https://gateway.ipfs.io/ipns/tokens.uniswap.org',
          'https://static.optimism.io/optimism.tokenlist.json',
        ],
      },
    },
  }),
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
