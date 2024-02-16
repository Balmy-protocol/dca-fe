import { createAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk } from '@state/createAppAsyncThunk';
import { LATEST_VERSION, MEAN_GRAPHQL_URL, SUPPORTED_NETWORKS_DCA } from '@constants';
import GraphqlService from '@services/graphql';
import { Token, TokenList, TokenListResponse, TokenType } from '@types';
import gqlFetchAll from '@common/utils/gqlFetchAll';
import { getURLFromQuery } from '@common/utils/parsing';
import GET_TOKEN_LIST from '@graphql/getTokenList.graphql';
import { Address } from 'viem';
import { toToken } from '@common/utils/currency';

export const enableDcaTokenList = createAction<{
  tokenList: string;
  enabled: boolean;
}>('tokenLists/enableDcaTokenList');

export const enableAllTokenList = createAction<{
  tokenList: string;
  enabled: boolean;
}>('tokenLists/enableAllTokenList');

export const addCustomToken = createAction<Token>('tokenLists/addCustomToken');

export const fetchTokenList = createAppAsyncThunk<TokenListResponse, string>(
  'tokenLists/fetchTokenLists',
  async (tokenListUrl, { extra: { axiosClient } }) => {
    const response = await axiosClient.get<TokenListResponse>(getURLFromQuery(tokenListUrl));

    return response.data;
  }
);

export const fetchGraphTokenList = createAppAsyncThunk<Token[]>('tokenLists/fetchGraphTokenList', async () => {
  const promises = SUPPORTED_NETWORKS_DCA.map(async (chainId) => {
    const dcaClient = new GraphqlService(MEAN_GRAPHQL_URL[LATEST_VERSION][chainId]);

    const tokens = await gqlFetchAll<{ tokens: Token[] }>(dcaClient.getClient(), GET_TOKEN_LIST, {}, 'tokens');

    return (
      tokens.data?.tokens.map((token) => ({
        ...token,
        address: token.address.toLowerCase() as Address,
        chainId,
      })) ?? []
    );
  });

  const promiseResults = await Promise.all(promises);

  return promiseResults.reduce<Token[]>((acc, tokenList) => [...acc, ...tokenList], []);
});

export const startFetchingTokenLists = createAppAsyncThunk(
  'tokenLists/startFetchingTokenLists',
  (nothing, { dispatch, getState }) => {
    const state = getState();

    Object.keys(state.tokenLists.byUrl)
      .filter((listUrl) => state.tokenLists.byUrl[listUrl].fetchable)
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .forEach((listUrl) => dispatch(fetchTokenList(listUrl)));
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(fetchGraphTokenList());
  }
);

export const fetchTokenDetails = createAppAsyncThunk<
  Token,
  { tokenAddress: string; chainId: number; tokenList: TokenList }
>(
  'tokenLists/fetchTokenDetails',
  async ({ tokenAddress, chainId, tokenList }, { dispatch, extra: { web3Service } }) => {
    if (tokenList[tokenAddress]) {
      return tokenList[tokenAddress];
    }
    const tokenContract = await web3Service.contractService.getERC20TokenInstance({
      chainId,
      tokenAddress: tokenAddress as Address,
      readOnly: true,
    });

    const [name, symbol, decimals] = await Promise.all([
      tokenContract.read.name(),
      tokenContract.read.symbol(),
      tokenContract.read.decimals(),
    ]);

    const customToken = toToken({
      address: tokenAddress,
      name,
      symbol,
      decimals,
      chainId,
      type: TokenType.ERC20_TOKEN,
    });

    dispatch(addCustomToken(customToken));
    return customToken;
  }
);
