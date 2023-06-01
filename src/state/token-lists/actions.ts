import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosInstance } from 'axios';
import { LATEST_VERSION, MEAN_GRAPHQL_URL, SUPPORTED_NETWORKS_DCA } from '@constants';
import GraphqlService from '@services/graphql';
import { Token, TokenListResponse, TokensLists } from '@types';
import gqlFetchAll from '@common/utils/gqlFetchAll';
import { getURLFromQuery } from '@common/utils/parsing';
import GET_TOKEN_LIST from '@graphql/getTokenList.graphql';

export const enableTokenList = createAction<{
  tokenList: string;
  enabled: boolean;
}>('tokenLists/enableTokenList');

export const enableAggregatorTokenList = createAction<{
  tokenList: string;
  enabled: boolean;
}>('tokenLists/enableAggregatorTokenList');

export const addCustomToken = createAction<Token>('tokenLists/addCustomToken');

export const fetchTokenList = createAsyncThunk<TokenListResponse, string, { extra: AxiosInstance }>(
  'tokenLists/fetchTokenLists',
  async (tokenListUrl, { extra: axiosClient }) => {
    const response = await axiosClient.get<TokenListResponse>(getURLFromQuery(tokenListUrl));

    return response.data;
  }
);

export const fetchGraphTokenList = createAsyncThunk<Token[], number | undefined, { extra: AxiosInstance }>(
  'tokenLists/fetchGraphTokenList',
  async () => {
    const promises: Promise<Token[]>[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const chainId of SUPPORTED_NETWORKS_DCA) {
      promises.push(
        (async () => {
          const dcaClient = new GraphqlService(MEAN_GRAPHQL_URL[LATEST_VERSION][chainId]);
          const tokens = await gqlFetchAll<{ tokens: Token[] }>(dcaClient.getClient(), GET_TOKEN_LIST, {}, 'tokens');

          return (
            tokens.data?.tokens.map((token) => ({
              ...token,
              address: token.address.toLowerCase(),
              chainId,
            })) ?? []
          );
        })()
      );
    }

    const results = await Promise.all(promises);

    return results.reduce((acc, chainTokens) => [...acc, ...chainTokens], []);
  }
);

export const startFetchingTokenLists = createAsyncThunk(
  'tokenLists/startFetchingTokenLists',
  (nothing, { dispatch, getState }) => {
    const state: { tokenLists: { byUrl: Record<string, TokensLists> } } = getState() as {
      tokenLists: { byUrl: Record<string, TokensLists> };
    };

    Object.keys(state.tokenLists.byUrl)
      .filter((listUrl) => state.tokenLists.byUrl[listUrl].fetchable)
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .forEach((listUrl) => dispatch(fetchTokenList(listUrl)));
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(fetchGraphTokenList());
  }
);
