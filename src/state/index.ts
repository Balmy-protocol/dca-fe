import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { save, load } from 'redux-localstorage-simple';

import blockNumber from './block-number/reducer';
import transactions from './transactions/reducer';

const PERSISTED_STATES: string[] = ['transactions'];

const store = configureStore({
  reducer: {
    transactions,
    blockNumber,
  },
  middleware: [...getDefaultMiddleware({ thunk: false }), save({ states: PERSISTED_STATES, debounce: 1000 })],
  preloadedState: load({ states: PERSISTED_STATES }),
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
