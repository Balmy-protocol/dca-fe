import { createReducer } from '@reduxjs/toolkit';
import {
  fetchWalletBalancesForChain,
  fetchPricesForChain,
  setLoadingBalance,
  setLoadingPrice,
  setTotalTokensLoaded,
} from './actions';
import { BigNumber } from 'ethers';
import { Token } from '@types';

export interface TokenBalancesAndPrices {
  [tokenAddress: string]: {
    token: Token;
    price?: number;
    balances: { [walletAddress: string]: BigNumber };
  };
}

export interface BalancesState {
  [chainId: number]: {
    balancesAndPrices: TokenBalancesAndPrices;
    isLoadingBalances: boolean;
    isLoadingPrices: boolean;
    totalTokensLoaded: { [walletAddress: string]: boolean };
  };
}

const initialState: BalancesState = {};

const emptyChainRecord: BalancesState[number] = {
  balancesAndPrices: {},
  isLoadingBalances: false,
  isLoadingPrices: false,
  totalTokensLoaded: {},
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(fetchWalletBalancesForChain.fulfilled, (state, { payload: { tokenBalances, chainId } }) => {
      if (!state[chainId]) {
        state[chainId] = emptyChainRecord;
      }

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
    .addCase(setLoadingBalance, (state, { payload: { chainId, isLoading } }) => {
      state[chainId] = { ...state[chainId], isLoadingBalances: isLoading };
      console.log('Loading Balances for:', chainId, isLoading);
    })
    .addCase(setLoadingPrice, (state, { payload: { chainId, isLoading } }) => {
      state[chainId] = { ...state[chainId], isLoadingPrices: isLoading };
      console.log('Loading Prices for:', chainId, isLoading);
    })
    .addCase(setTotalTokensLoaded, (state, { payload: { chainId, walletAddress, totalTokensLoaded } }) => {
      if (!state[chainId]) {
        state[chainId] = emptyChainRecord;
      }

      state[chainId] = {
        ...state[chainId],
        totalTokensLoaded: {
          [walletAddress]: totalTokensLoaded,
        },
      };
    })
);
