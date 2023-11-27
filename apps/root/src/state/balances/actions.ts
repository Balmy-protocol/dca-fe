import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Token, TokenList, TokenListByChainId } from '@types';
import { TokenBalancesAndPrices } from './reducer';
import { PriceResult } from '@mean-finance/sdk';
import { ExtraArgument, RootState } from '@state';
import { BigNumber } from 'ethers';
import { NETWORKS } from '@constants';
import { keyBy } from 'lodash';

export type PriceResponse = Record<string, PriceResult>;

export const setLoadingBalanceState = createAction<{ chainId: number; isLoading: boolean }>(
  'balances/setLoadingBalanceState'
);
export const setLoadingPriceState = createAction<{ chainId: number; isLoading: boolean }>(
  'balances/setLoadingPriceState'
);

export const fetchWalletBalancesForChain = createAsyncThunk<
  { chainId: number; tokenBalances: TokenBalancesAndPrices },
  { tokenList: TokenList; chainId: number; walletAddress: string },
  { extra: ExtraArgument }
>(
  'balances/fetchBalancesForChain',
  async ({ tokenList, chainId, walletAddress }, { extra: { web3Service }, dispatch }) => {
    const sdkService = web3Service.getSdkService();
    const tokens = Object.values(tokenList);

    console.log('fetchingBalances for chainId:', chainId, 'and wallet:', walletAddress);
    let balances: Record<number, Record<string, BigNumber>> = {};
    try {
      dispatch(setLoadingBalanceState({ chainId, isLoading: true }));
      balances = await sdkService.getMultipleBalances(tokens, walletAddress);
    } catch (e) {
      console.error(e);
    }
    dispatch(setLoadingBalanceState({ chainId, isLoading: false }));

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
  { chainId: number; prices: PriceResponse },
  { chainId: number },
  { extra: ExtraArgument }
>('prices/fetchPricesForChain', async ({ chainId }, { extra: { web3Service }, getState, dispatch }) => {
  const sdkService = web3Service.getSdkService();
  const state = getState() as RootState;
  const storedTokenAddresses = Object.values(state.balances[chainId].balancesAndPrices || {}).map(
    (tokenBalance) => tokenBalance.token.address
  );
  let priceResponse: PriceResponse = {};
  if (!!storedTokenAddresses.length) {
    try {
      console.log('fetchingPrices for chainId:', chainId);
      dispatch(setLoadingPriceState({ chainId, isLoading: true }));
      priceResponse = await sdkService.sdk.priceService.getCurrentPricesForChain({
        chainId,
        addresses: storedTokenAddresses,
      });
    } catch (e) {
      console.error(e);
    }
    dispatch(setLoadingPriceState({ chainId, isLoading: false }));
  }
  return { chainId, prices: priceResponse };
});

export const fetchBalances = createAsyncThunk<void, void, { extra: ExtraArgument }>(
  'balances/fetchBalances',
  async (nothing, { extra: { web3Service }, dispatch, getState }) => {
    const meanApiService = web3Service.getMeanApiService();
    const sdkService = web3Service.getSdkService();
    const state = getState() as RootState;
    const mostUsedTokens = state.tokenLists.mostUsedTokens.tokens;

    const mostUsedTokensListByChain: TokenListByChainId = mostUsedTokens.reduce((acc, token) => {
      const existingTokensForChain = acc[token.chainId] || [];
      return {
        ...acc,
        [token.chainId]: { ...existingTokensForChain, [token.address]: token },
      };
    }, {} as TokenListByChainId);

    const { lastIndexedBlocks, usedTokens } = await meanApiService.getIndexedUserTokens();

    const tokenListForFetching: { [wallet: string]: TokenListByChainId } = usedTokens;

    Object.values(NETWORKS).forEach(async (network) => {
      const chainProvider = await sdkService.providerService.getProvider(undefined, network);
      const currentBlock = await chainProvider.getBlockNumber();

      Object.entries(lastIndexedBlocks).forEach(([chainId, walletsInfo]) => {
        Object.entries(walletsInfo).forEach(([walletAddress, lastIndexedBlock]) => {
          if (currentBlock - lastIndexedBlock > 50) {
            tokenListForFetching[walletAddress][Number(chainId)] = mostUsedTokensListByChain[Number(chainId)];
          }
        });
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
