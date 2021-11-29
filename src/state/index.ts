import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { save, load } from 'redux-localstorage-simple';

import blockNumber from './block-number/reducer';
import transactions from './transactions/reducer';
import badge from './transactions-badge/reducer';
import initializer from './initializer/reducer';
import tokenLists from './token-lists/reducer';
import config from './config/reducer';

const PERSISTED_STATES: string[] = ['transactions', 'badge', 'tokenLists', 'config'];

const store = configureStore({
  reducer: {
    transactions,
    blockNumber,
    initializer,
    badge,
    tokenLists,
    config,
  },
  middleware: [...getDefaultMiddleware({ thunk: false }), save({ states: PERSISTED_STATES, debounce: 1000 })],
  preloadedState: load({ states: PERSISTED_STATES }),
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
