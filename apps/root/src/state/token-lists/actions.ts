import { createAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk } from '@state/createAppAsyncThunk';
import { Token, TokenList, TokenListId, TokenListResponse, TokenType } from '@types';
import { getURLFromQuery } from '@common/utils/parsing';
import { Address } from 'viem';
import { toToken } from '@common/utils/currency';

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
// "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
// "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
export const fetchTokenDetails = createAppAsyncThunk<
  Token,
  { tokenAddress: string; chainId: number; tokenList: TokenList }
>('tokenLists/fetchTokenDetails', ({ tokenAddress, chainId, tokenList }) => {
  const id = `${chainId}-${tokenAddress}` as TokenListId;
  if (tokenList[id]) {
    return tokenList[id];
  }

  console.log(tokenList, id, chainId, tokenAddress);

  // const tokenContract = await web3Service.contractService.getERC20TokenInstance({
  //   chainId,
  //   tokenAddress: tokenAddress as Address,
  //   readOnly: true,
  // });

  // const [name, symbol, decimals] = await Promise.all([
  //   tokenContract.read.name(),
  //   tokenContract.read.symbol(),
  //   tokenContract.read.decimals(),
  // ]);

  // const customToken = toToken({
  //   address: tokenAddress,
  //   name,
  //   symbol,
  //   decimals,
  //   chainId,
  //   type: TokenType.ERC20_TOKEN,
  // });

  // dispatch(addCustomToken(customToken));
  // return customToken;
  // return Promise.resolve(undefined);
  throw new Error('shit');
});
