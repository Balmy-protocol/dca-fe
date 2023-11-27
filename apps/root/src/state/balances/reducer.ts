import { createReducer } from '@reduxjs/toolkit';
import {
  fetchWalletBalancesForChain,
  fetchPricesForChain,
  setLoadingBalanceState,
  setLoadingPriceState,
} from './actions';
import { BigNumber } from 'ethers';
import { Token } from '@types';

export interface TokenBalancesAndPrices {
  [tokenAddress: string]: {
    token: Token;
    price?: number;
    balances: { [wallet: string]: BigNumber };
  };
}

export interface BalancesState {
  [chainId: number]: {
    balancesAndPrices: TokenBalancesAndPrices;
    isLoadingBalances: boolean;
    isLoadingPrices: boolean;
  };
}

const initialState: BalancesState = {};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchWalletBalancesForChain.fulfilled, (state, { payload: { tokenBalances, chainId } }) => {
      Object.entries(tokenBalances).forEach(([tokenAddress, tokenBalance]) => {
        if (!state[chainId].balancesAndPrices) {
          state[chainId].balancesAndPrices = {};
        }
        state[chainId].balancesAndPrices[tokenAddress] = {
          ...state[chainId].balancesAndPrices[tokenAddress],
          token: tokenBalance.token,
          balances: tokenBalance.balances,
        };
      });
    })
    .addCase(fetchPricesForChain.fulfilled, (state, { payload: { chainId, prices } }) => {
      Object.entries(prices).forEach(([address, price]) => {
        state[chainId].balancesAndPrices[address].price = price.price;
      });
    })
    .addCase(setLoadingBalanceState, (state, { payload: { chainId, isLoading } }) => {
      state[chainId] = { ...state[chainId], isLoadingBalances: isLoading };
      console.log('Loading Balances for:', chainId, isLoading);
    })
    .addCase(setLoadingPriceState, (state, { payload: { chainId, isLoading } }) => {
      state[chainId] = { ...state[chainId], isLoadingPrices: isLoading };
      console.log('Loading Prices for:', chainId, isLoading);
    })
);
