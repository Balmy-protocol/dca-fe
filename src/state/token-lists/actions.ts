import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosInstance } from 'axios';
import { TokenListResponse, TokensLists } from 'types';
import { getURLFromQuery } from 'utils/parsing';

export const enableTokenList =
  createAction<{
    tokenList: string;
    enabled: boolean;
  }>('tokenLists/enableTokenList');

export const fetchTokenList = createAsyncThunk<TokenListResponse, string, { extra: AxiosInstance }>(
  'tokenLists/fetchTokenLists',
  async (tokenListUrl, { extra: axiosClient }) => {
    const response = await axiosClient.get<TokenListResponse>(getURLFromQuery(tokenListUrl));

    return response.data;
  }
);

export const startFetchingTokenLists = createAsyncThunk(
  'tokenLists/startFetchingTokenLists',
  (nothing, { dispatch, getState }) => {
    const state: { tokenLists: { byUrl: Record<string, TokensLists> } } = getState() as {
      tokenLists: { byUrl: Record<string, TokensLists> };
    };

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    Object.keys(state.tokenLists.byUrl).forEach((listUrl) => dispatch(fetchTokenList(listUrl)));
  }
);
