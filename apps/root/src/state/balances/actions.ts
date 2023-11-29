import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { CurrentPriceForChainResponse, IndexedUserTokensResponse, Token, TokenList, TokenListByChainId } from '@types';
import { TokenBalancesAndPrices } from './reducer';
import { ExtraArgument, RootState } from '@state';
import { BigNumber } from 'ethers';
import { NETWORKS } from '@constants';
import { keyBy } from 'lodash';

export const setLoadingBalance = createAction<{ chainId: number; isLoading: boolean }>('balances/setLoadingBalance');
export const setLoadingPrice = createAction<{ chainId: number; isLoading: boolean }>('balances/setLoadingPrice');
export const setTotalTokensLoaded = createAction<{
  chainId: number;
  walletAddress: string;
  totalTokensLoaded: boolean;
}>('balances/setTotalTokensLoaded');

export const fetchWalletBalancesForChain = createAsyncThunk<
  { chainId: number; tokenBalances: TokenBalancesAndPrices },
  { tokenList: TokenList; chainId: number; walletAddress: string },
  { extra: ExtraArgument }
>(
  'balances/fetchBalancesForChain',
  async ({ tokenList, chainId, walletAddress }, { extra: { web3Service }, dispatch }) => {
    const sdkService = web3Service.getSdkService();
    const tokens = Object.values(tokenList);

    let balances: Record<number, Record<string, BigNumber>> = {};
    try {
      dispatch(setLoadingBalance({ chainId, isLoading: true }));
      balances = await sdkService.getMultipleBalances(tokens, walletAddress);
    } catch (e) {
      console.error(e);
    }
    dispatch(setLoadingBalance({ chainId, isLoading: false }));

    const tokenAccountBalances: TokenBalancesAndPrices = {};
    Object.entries(balances[chainId]).forEach(([tokenAddress, balance]) => {
      if (balance.gt(0)) {
        tokenAccountBalances[tokenAddress] = {
          token: tokenList[tokenAddress],
          balances: {
            [walletAddress]: balance,
          },
        };
      }
    });

    return { chainId, tokenBalances: tokenAccountBalances };
  }
);

export const fetchPricesForChain = createAsyncThunk<
  { chainId: number; prices: CurrentPriceForChainResponse },
  { chainId: number },
  { extra: ExtraArgument }
>('prices/fetchPricesForChain', async ({ chainId }, { extra: { web3Service }, getState, dispatch }) => {
  const sdkService = web3Service.getSdkService();
  const state = getState() as RootState;
  const storedTokenAddresses = Object.values(state.balances[chainId].balancesAndPrices || {}).map(
    (tokenBalance) => tokenBalance.token.address
  );
  let priceResponse: CurrentPriceForChainResponse = {};
  if (!!storedTokenAddresses.length) {
    try {
      dispatch(setLoadingPrice({ chainId, isLoading: true }));
      priceResponse = await sdkService.sdk.priceService.getCurrentPricesForChain({
        chainId,
        addresses: storedTokenAddresses,
      });
    } catch (e) {
      console.error(e);
    }
    dispatch(setLoadingPrice({ chainId, isLoading: false }));
  }
  return { chainId, prices: priceResponse };
});

export const fetchBalances = createAsyncThunk<void, void, { extra: ExtraArgument }>(
  'balances/fetchBalances',
  async (nothing, { extra: { web3Service }, dispatch, getState }) => {
    const meanApiService = web3Service.getMeanApiService();
    const sdkService = web3Service.getSdkService();
    const accountService = web3Service.getAccountService();
    const user = accountService.getUser();
    const state = getState() as RootState;

    if (!user) return;
    const signature = await accountService.getWalletVerifyingSignature({});

    const mostUsedTokens = state.tokenLists.mostUsedTokens.tokens;
    const mostUsedTokensListByChainId: TokenListByChainId = mostUsedTokens.reduce((acc, token) => {
      const existingTokensForChain = acc[token.chainId] || {};
      return {
        ...acc,
        [token.chainId]: { ...existingTokensForChain, [token.address]: token },
      };
    }, {} as TokenListByChainId);

    let indexedUserTokensResponse: IndexedUserTokensResponse = { lastIndexedBlocks: {}, usedTokens: {} };
    try {
      indexedUserTokensResponse = await meanApiService.getIndexedUserTokens({
        accountId: user.id,
        signature,
      });
    } catch (e) {
      console.error(e);
    }
    const { lastIndexedBlocks, usedTokens } = indexedUserTokensResponse;
    const tokenListForFetching: { [walletAddress: string]: TokenListByChainId } = usedTokens;

    Object.values(NETWORKS).forEach(async (network) => {
      const chainProvider = await sdkService.providerService.getProvider(undefined, network);
      const currentBlock = await chainProvider.getBlockNumber();
      const { chainId } = network;

      Object.entries(lastIndexedBlocks[chainId]).forEach(([walletAddress, lastIndexedBlock]) => {
        const isIndexed = currentBlock - lastIndexedBlock < 50;
        if (!isIndexed) {
          tokenListForFetching[walletAddress][chainId] = mostUsedTokensListByChainId[chainId];
        }

        dispatch(setTotalTokensLoaded({ chainId: chainId, walletAddress, totalTokensLoaded: isIndexed }));
      });
    });

    for (const chainId of Object.keys(NETWORKS)) {
      const chainBalancesPromises: Promise<unknown>[] = [];

      for (const [walletAddress, tokenListByChain] of Object.entries(tokenListForFetching)) {
        const tokenList = tokenListByChain[Number(chainId)];
        if (tokenList) {
          chainBalancesPromises.push(
            dispatch(
              fetchWalletBalancesForChain({
                chainId: Number(chainId),
                tokenList,
                walletAddress,
              })
            )
          );
        }
      }

      await Promise.all(chainBalancesPromises);
      await dispatch(fetchPricesForChain({ chainId: Number(chainId) }));
    }
  }
);

export const updateTokens = createAsyncThunk<void, { tokens: Token[]; chainId: number; walletAddress: string }>(
  'balances/updateTokens',
  async ({ tokens, chainId, walletAddress }, { dispatch }) => {
    tokens.forEach((token) => {
      if (token.chainId !== chainId) {
        throw new Error('All tokens must belong to the same network');
      }
    });
    const tokenList = keyBy(tokens, 'address');

    await dispatch(fetchWalletBalancesForChain({ chainId, tokenList, walletAddress }));
    await dispatch(fetchPricesForChain({ chainId }));
  }
);
