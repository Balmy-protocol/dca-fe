import { createReducer } from '@reduxjs/toolkit';
import { fetchWalletBalancesForChain, fetchPricesForChain, fetchInitialBalances } from './actions';

import { Token } from '@types';

export interface TokenBalancesAndPrices {
  [tokenAddress: string]: {
    token: Token;
    price?: number;
    balances: { [walletAddress: string]: bigint };
  };
}

export interface BalancesState {
  [chainId: number]: {
    balancesAndPrices: TokenBalancesAndPrices;
    isLoadingChainPrices: boolean;
  };
  isLoadingAllBalances: boolean;
}

const initialState: BalancesState = { isLoadingAllBalances: true };

export default createReducer(initialState, (builder) => {
  builder
    .addCase(fetchInitialBalances.fulfilled, (state, { payload }) => {
      for (const chainId of Object.keys(payload)) {
        state[Number(chainId)] = payload[Number(chainId)];
      }
      state.isLoadingAllBalances = false;
    })
    .addCase(fetchInitialBalances.pending, (state) => {
      state.isLoadingAllBalances = true;
    })
    .addCase(fetchInitialBalances.rejected, (state) => {
      state.isLoadingAllBalances = false;
    })
    .addCase(fetchWalletBalancesForChain.fulfilled, (state, { payload: { tokenBalances, chainId, walletAddress } }) => {
      if (Object.keys(tokenBalances).length > 0) {
        state[chainId] = state[chainId] || { isLoadingChainPrices: false, balancesAndPrices: {} };
        Object.entries(tokenBalances).forEach(([tokenAddress, tokenBalance]) => {
          const existingBalances = state[chainId].balancesAndPrices[tokenAddress]?.balances || {};

          state[chainId].balancesAndPrices[tokenAddress] = {
            ...state[chainId].balancesAndPrices[tokenAddress],
            token: tokenBalance.token,
            balances: {
              ...existingBalances,
              [walletAddress]: tokenBalance.balances[walletAddress],
            },
          };
        });
      }
    })
    .addCase(fetchPricesForChain.fulfilled, (state, { payload: { chainId, prices } }) => {
      Object.entries(prices).forEach(([address, price]) => {
        state[chainId].balancesAndPrices[address].price = price.price;
      });
      state[chainId].isLoadingChainPrices = false;
    })
    .addCase(fetchPricesForChain.pending, (state, { meta: { arg } }) => {
      const { chainId } = arg;
      state[chainId] = state[chainId] || { balancesAndPrices: {} };
      state[chainId].isLoadingChainPrices = true;
    })
    .addCase(fetchPricesForChain.rejected, (state, { meta: { arg } }) => {
      const { chainId } = arg;
      state[chainId] = state[chainId] || { balancesAndPrices: {} };
      state[chainId].isLoadingChainPrices = false;
    });
});
