import { createReducer } from '@reduxjs/toolkit';
import { fetchWalletBalancesForChain, fetchPricesForChain, fetchInitialBalances, cleanBalances } from './actions';

import { Token } from '@types';
import { isUndefined } from 'lodash';

export interface TokenBalancesAndPrices {
  [tokenAddress: string]: {
    token: Token;
    price?: number;
    balances: { [walletAddress: string]: bigint };
  };
}

export interface BalancesState {
  balances: {
    [chainId: number]: {
      balancesAndPrices: TokenBalancesAndPrices;
      isLoadingChainPrices: boolean;
    };
  };
  isLoadingAllBalances: boolean;
}

const initialState: BalancesState = { isLoadingAllBalances: false, balances: {} };

export default createReducer(initialState, (builder) => {
  builder
    .addCase(cleanBalances, () => initialState)
    .addCase(fetchInitialBalances.fulfilled, (state, { payload }) => {
      for (const chainId of Object.keys(payload)) {
        state.balances[Number(chainId)] = payload[Number(chainId)];
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
        state.balances[chainId] = state.balances[chainId] || { isLoadingChainPrices: false, balancesAndPrices: {} };
        Object.entries(tokenBalances).forEach(([tokenAddress, tokenBalance]) => {
          const someAccountWithBalance = Object.values(tokenBalance.balances).some((balance) => balance > 0n);
          const oldBalances = state.balances[chainId].balancesAndPrices[tokenAddress]?.balances || {};
          const someAccountWithStoredBalance = Object.keys(oldBalances)
            .filter((key) => key !== walletAddress)
            .some((balanceKey) => oldBalances[balanceKey] > 0n);
          if (someAccountWithBalance || someAccountWithStoredBalance) {
            const existingBalances = state.balances[chainId].balancesAndPrices[tokenAddress]?.balances || {};

            state.balances[chainId].balancesAndPrices[tokenAddress] = {
              ...state.balances[chainId].balancesAndPrices[tokenAddress],
              token: tokenBalance.token,
              balances: {
                ...existingBalances,
                [walletAddress]: tokenBalance.balances[walletAddress],
              },
            };
          } else {
            delete state.balances[chainId].balancesAndPrices[tokenAddress];
          }
        });
      }
    })
    .addCase(fetchPricesForChain.fulfilled, (state, { payload: { chainId, prices } }) => {
      Object.entries(prices).forEach(([address, price]) => {
        if (!isUndefined(price) && !isUndefined(price.price)) {
          state.balances[chainId].balancesAndPrices[address].price = price.price;
        }
      });
      state.balances[chainId].isLoadingChainPrices = false;
    })
    .addCase(fetchPricesForChain.pending, (state, { meta: { arg } }) => {
      const { chainId } = arg;
      state.balances[chainId] = state.balances[chainId] || { balancesAndPrices: {} };
      state.balances[chainId].isLoadingChainPrices = true;
    })
    .addCase(fetchPricesForChain.rejected, (state, { meta: { arg } }) => {
      const { chainId } = arg;
      state.balances[chainId] = state.balances[chainId] || { balancesAndPrices: {} };
      state.balances[chainId].isLoadingChainPrices = false;
    });
});
