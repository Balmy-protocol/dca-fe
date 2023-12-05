import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, ExtraArgument, RootState } from '@state';

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  extra: ExtraArgument;
  state: RootState;
  dispatch: AppDispatch;
}>();
