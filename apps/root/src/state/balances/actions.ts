import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { CurrentPriceForChainResponse, Token, TokenList } from '@types';
import { BalancesState, TokenBalancesAndPrices } from './reducer';
import { ExtraArgument, RootState } from '@state';
import { BigNumber } from 'ethers';
import { NETWORKS } from '@constants';
import { flatten, keyBy, set } from 'lodash';

export const setLoadingChainPrices = createAction<{ chainId: number; isLoading: boolean }>(
  'balances/setLoadingChainPrices'
);

export const fetchWalletBalancesForChain = createAsyncThunk<
  { chainId: number; tokenBalances: TokenBalancesAndPrices },
  { tokenList: TokenList; chainId: number; walletAddress: string },
  { extra: ExtraArgument }
>('balances/fetchBalancesForChain', async ({ tokenList, chainId, walletAddress }, { extra: { web3Service } }) => {
  const sdkService = web3Service.getSdkService();
  const tokens = Object.values(tokenList);

  let balances: Record<number, Record<string, BigNumber>> = {};
  try {
    balances = await sdkService.getMultipleBalances(tokens, walletAddress);
  } catch (e) {
    console.error(e);
  }

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
});

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
      dispatch(setLoadingChainPrices({ chainId, isLoading: true }));
      priceResponse = await sdkService.sdk.priceService.getCurrentPricesForChain({
        chainId,
        addresses: storedTokenAddresses,
      });
    } catch (e) {
      console.error(e);
    }
    dispatch(setLoadingChainPrices({ chainId, isLoading: false }));
  }

  return { chainId, prices: priceResponse };
});

export const fetchPricesForAllChains = createAsyncThunk<void, void, { extra: ExtraArgument }>(
  'balances/fetchInitialBalances',
  async (nothing, { getState, dispatch }) => {
    const state = getState() as RootState;
    const chainsWithBalance = Object.keys(state.balances);

    const pricePromises = chainsWithBalance.map(async (chainId) =>
      dispatch(fetchPricesForChain({ chainId: Number(chainId) }))
    );
    await Promise.all(pricePromises);
  }
);

export const fetchInitialBalances = createAsyncThunk<BalancesState, void, { extra: ExtraArgument }>(
  'balances/fetchInitialBalances',
  async (nothing, { extra: { web3Service }, getState }) => {
    const accountService = web3Service.getAccountService();
    const meanApiService = web3Service.getMeanApiService();
    const chainIds = Object.values(NETWORKS).map((network) => network.chainId);
    const wallets = accountService.getWallets().map((wallet) => wallet.address);
    const state = getState() as RootState;
    const allTokens = flatten(Object.values(state.tokenLists.byUrl).map((list) => list.tokens));
    const tokenList: TokenList = keyBy(allTokens, 'address');

    const accountBalancesResponse = await meanApiService.getAccountBalances({
      wallets,
      chainIds,
    });

    const parsedAccountBalances: BalancesState = { isLoadingAllBalances: false };
    for (const walletAddress in accountBalancesResponse.balances) {
      Object.entries(accountBalancesResponse.balances[walletAddress]).forEach(([chainId, balances]) => {
        Object.entries(balances).forEach(([tokenAddress, balance]) => {
          set(
            parsedAccountBalances,
            [Number(chainId), 'balancesAndPrices', tokenAddress, 'balances', walletAddress],
            BigNumber.from(balance)
          );
          set(
            parsedAccountBalances,
            [Number(chainId), 'balancesAndPrices', tokenAddress, 'token'],
            tokenList[tokenAddress]
          );
        });
      });
    }
    return parsedAccountBalances;
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
