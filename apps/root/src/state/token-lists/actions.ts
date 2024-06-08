import { createAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk } from '@state/createAppAsyncThunk';
import { Token, TokenListId, TokenListResponse, TokenType } from '@types';
import { getURLFromQuery, parseTokenList } from '@common/utils/parsing';
import { Address } from 'viem';
import { toToken } from '@common/utils/currency';
import { PROTOCOL_TOKEN_ADDRESS, getProtocolToken } from '@common/mocks/tokens';

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

export const startFetchingTokenLists = createAppAsyncThunk(
  'tokenLists/startFetchingTokenLists',
  (nothing, { dispatch, getState }) => {
    const state = getState();

    Object.keys(state.tokenLists.byUrl)
      .filter((listUrl) => state.tokenLists.byUrl[listUrl].fetchable)
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .forEach((listUrl) => dispatch(fetchTokenList(listUrl)));
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
  }
);

export const fetchTokenDetails = createAppAsyncThunk<Token, { tokenAddress: string; chainId: number }>(
  'tokenLists/fetchTokenDetails',
  async ({ tokenAddress, chainId }, { dispatch, getState, extra: { web3Service } }) => {
    const id = `${chainId}-${tokenAddress.toLowerCase()}` as TokenListId;
    const { byUrl: tokensLists, customTokens } = getState().tokenLists;

    const curatedTokenList = parseTokenList({
      tokensLists: {
        ...tokensLists,
      },
      chainId,
      curateList: true,
    });

    if (curatedTokenList[id]) {
      return curatedTokenList[id];
    }

    if (tokenAddress.toLowerCase() === PROTOCOL_TOKEN_ADDRESS) {
      return getProtocolToken(chainId);
    }

    const completeTokenList = parseTokenList({
      tokensLists: {
        ...tokensLists,
        'custom-tokens': customTokens,
      },
      chainId,
    });

    let customToken = completeTokenList[id];

    if (!customToken) {
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

      customToken = toToken({
        address: tokenAddress,
        name,
        symbol,
        decimals,
        chainId,
        type: TokenType.ERC20_TOKEN,
      });
    }

    dispatch(addCustomToken(customToken));
    return customToken;
  }
);
