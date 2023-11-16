import { createAsyncThunk } from '@reduxjs/toolkit';
import { Token, TokenList, TokenListByChainId } from '@types';
import { TokenBalancesAndPrices } from './reducer';
import { PriceResult } from '@mean-finance/sdk';
import { ExtraArgument, RootState } from '@state';

export type PriceResponse = Record<string, PriceResult>;

export const fetchBalancesForChain = createAsyncThunk<
  { chainId: number; tokenBalances: TokenBalancesAndPrices },
  { tokenList: TokenList; chainId: number },
  { extra: ExtraArgument }
>('balances/fetchBalancesForChain', async ({ tokenList, chainId }, { extra: { web3Service } }) => {
  const { sdkService, accountService } = web3Service;
  const wallets = accountService.getWallets();
  const tokens = Object.values(tokenList);
  const balancePromises = wallets.map((wallet) =>
    sdkService
      .getMultipleBalances(tokens, wallet.address)
      .then((balancesByChain) => ({ wallet: wallet.address, tokenBalances: balancesByChain[chainId] }))
      .catch((e) => {
        console.error(e);
        return null;
      })
  );
  const balances = await Promise.all(balancePromises);
  const tokenAccountBalances: TokenBalancesAndPrices = {};

  balances.forEach((result) => {
    if (result) {
      const { wallet, tokenBalances } = result;
      Object.entries(tokenBalances).forEach(([address, balance]) => {
        if (balance.gt(0)) {
          tokenAccountBalances[address] = { token: tokenList[address], balances: { [wallet]: balance } };
        }
      });
    }
  });
  return { chainId, tokenBalances: tokenAccountBalances };
});

export const fetchPricesForChain = createAsyncThunk<
  { chainId: number; prices: PriceResponse },
  { chainId: number },
  { extra: ExtraArgument }
>('prices/fetchPricesForChain', async ({ chainId }, { extra: { web3Service }, getState }) => {
  const { sdkService } = web3Service;
  const state = getState() as RootState;
  const storedTokensByChain = Object.values(state.balances[Number(chainId)] || {}).map(
    (tokenBalance) => tokenBalance.token
  );
  const tokenAddresses = storedTokensByChain.map((token) => token.address);
  let priceResponse: PriceResponse = {};
  try {
    if (!!tokenAddresses.length) {
      priceResponse = await sdkService.sdk.priceService.getCurrentPricesForChain({
        chainId,
        addresses: tokenAddresses,
      });
    }
  } catch (e) {
    console.error(e);
  }
  return { chainId, prices: priceResponse };
});

export const fetchBalances = createAsyncThunk<void, { tokenListByChainId: TokenListByChainId }>(
  'balances/fetchBalances',
  async ({ tokenListByChainId }, { dispatch }) => {
    const balanceAndPricePromises = Object.entries(tokenListByChainId).map(async ([chainId, tokenListByChain]) => {
      await dispatch(fetchBalancesForChain({ chainId: Number(chainId), tokenList: tokenListByChain }));
      return dispatch(fetchPricesForChain({ chainId: Number(chainId) }));
    });

    await Promise.all(balanceAndPricePromises);
  }
);

export const updateTokens = createAsyncThunk<void, { tokens: Token[]; chainId: number }>(
  'balances/updateTokens',
  async ({ tokens, chainId }, { dispatch }) => {
    tokens.forEach((token) => {
      if (token.chainId !== chainId) {
        throw new Error('All tokens must belong to the same network');
      }
    });

    const tokenList = tokens.reduce((acc, token) => {
      return { ...acc, [token.address]: token };
    }, {} as TokenList);

    await dispatch(fetchBalancesForChain({ chainId, tokenList }));
    await dispatch(fetchPricesForChain({ chainId }));
  }
);
