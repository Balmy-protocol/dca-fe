import { createReducer } from '@reduxjs/toolkit';
import { fetchBalancesForChain, fetchPricesForChain } from './actions';
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
  [chainId: number]: TokenBalancesAndPrices;
}

const initialState: BalancesState = {};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchBalancesForChain.fulfilled, (state, { payload: { tokenBalances, chainId } }) => {
      Object.entries(tokenBalances).forEach(([tokenAddress, tokenBalance]) => {
        if (!state[chainId]) {
          state[chainId] = {};
        }
        state[chainId][tokenAddress] = tokenBalance;
      });
    })
    .addCase(fetchPricesForChain.fulfilled, (state, { payload: { chainId, prices } }) => {
      Object.entries(prices).forEach(([address, price]) => {
        state[chainId][address].price = price.price;
      });
    })
);
