import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosInstance } from 'axios';
import { MEAN_GRAPHQL_URL, POSITION_VERSION_3 } from 'config/constants';
import GraphqlService from 'services/graphql';
import { Token, TokenListResponse, TokensLists } from 'types';
import gqlFetchAll from 'utils/gqlFetchAll';
import { getURLFromQuery } from 'utils/parsing';
import GET_TOKEN_LIST from 'graphql/getTokenList.graphql';

export const enableTokenList = createAction<{
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

export const fetchGraphTokenList = createAsyncThunk<Token[], undefined, { extra: AxiosInstance }>(
  'tokenLists/fetchGraphTokenList',
  async (garbage, { getState }) => {
    const {
      config: { network },
    } = getState() as {
      config: { network: { chainId: number; name: string } };
    };

    const dcaClient = new GraphqlService(
      (network && MEAN_GRAPHQL_URL[POSITION_VERSION_3][network.chainId]) || MEAN_GRAPHQL_URL[POSITION_VERSION_3][10]
    );

    const tokens = await gqlFetchAll<{ tokens: Token[] }>(dcaClient.getClient(), GET_TOKEN_LIST, {}, 'tokens');

    return (
      tokens.data?.tokens.map((token) => ({
        ...token,
        address: token.address.toLowerCase(),
        chainId: network.chainId,
      })) ?? []
    );
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
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(fetchGraphTokenList());
  }
);
