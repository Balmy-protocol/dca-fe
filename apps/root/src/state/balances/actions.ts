import { Address, CurrentPriceForChainResponse, Token, TokenList, TokenListByChainId, TokenListId } from '@types';
import { BalancesState, TokenBalancesAndPrices } from './reducer';
import { createAppAsyncThunk } from '@state/createAppAsyncThunk';
import { createAction, unwrapResult } from '@reduxjs/toolkit';

import { cloneDeep, keyBy, set, union } from 'lodash';
import { fetchTokenDetails } from '@state/token-lists/actions';
import { getAllChains } from '@mean-finance/sdk';

export const cleanBalances = createAction('balances/cleanBalances');

export const fetchWalletBalancesForChain = createAppAsyncThunk<
  { chainId: number; tokenBalances: TokenBalancesAndPrices; walletAddress: string },
  { tokenList: TokenList; chainId: number; walletAddress: string }
>('balances/fetchWalletBalancesForChain', async ({ tokenList, chainId, walletAddress }, { extra: { web3Service } }) => {
  const sdkService = web3Service.getSdkService();
  const tokens = Object.values(tokenList);

  const balances = await sdkService.getMultipleBalances(tokens, walletAddress);

  const tokenBalances = Object.entries(balances[chainId]).reduce<TokenBalancesAndPrices>(
    (acc, [tokenAddress, balance]) => {
      // eslint-disable-next-line no-param-reassign
      acc[tokenAddress] = {
        token: tokenList[`${chainId}-${tokenAddress.toLowerCase()}` as TokenListId],
        balances: {
          [walletAddress]: balance,
        },
      };
      return acc;
    },
    {}
  );
  return { chainId, tokenBalances, walletAddress };
});

export const fetchPricesForChain = createAppAsyncThunk<
  { chainId: number; prices: CurrentPriceForChainResponse },
  { chainId: number }
>('prices/fetchPricesForChain', async ({ chainId }, { extra: { web3Service }, getState }) => {
  const sdkService = web3Service.getSdkService();
  const state = getState();
  const storedTokenAddresses = Object.values(state.balances.balances[chainId].balancesAndPrices || {}).map(
    (tokenBalance) => tokenBalance.token.address
  );
  let priceResponse: CurrentPriceForChainResponse = {};
  if (!!storedTokenAddresses.length) {
    priceResponse = await sdkService.sdk.priceService.getCurrentPricesForChain({
      chainId,
      addresses: storedTokenAddresses,
    });
  }

  return { chainId, prices: priceResponse };
});

export const fetchPricesForAllChains = createAppAsyncThunk<void, void>(
  'balances/fetchPricesForAllChains',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const { balances } = state.balances;
    const pricePromises = Object.keys(balances).map((chainId) =>
      dispatch(fetchPricesForChain({ chainId: Number(chainId) }))
    );
    await Promise.all(pricePromises);
  }
);

export const updateTokens = createAppAsyncThunk<void, { tokens: Token[]; chainId: number; walletAddress: string }>(
  'balances/updateTokens',
  async ({ tokens, chainId, walletAddress }, { dispatch }) => {
    tokens.forEach((token) => {
      if (token.chainId !== chainId) {
        throw new Error('All tokens must belong to the same network');
      }
    });
    const tokenList = keyBy(
      tokens.map(({ address, ...rest }) => ({ address: address.toLowerCase() as Address, ...rest })),
      ({ address }) => `${chainId}-${address}`
    );

    await dispatch(fetchWalletBalancesForChain({ chainId, tokenList, walletAddress }));
    await dispatch(fetchPricesForChain({ chainId }));
  }
);

export const fetchInitialBalances = createAppAsyncThunk<BalancesState['balances'], void>(
  'balances/fetchInitialBalances',
  async (_, { dispatch, getState, extra: { web3Service } }) => {
    const accountService = web3Service.getAccountService();
    const meanApiService = web3Service.getMeanApiService();
    const sdkService = web3Service.getSdkService();
    const chainIds = getAllChains().map((chain) => chain.chainId);
    const wallets = accountService.getWallets().map((wallet) => wallet.address);

    const parsedAccountBalances: BalancesState['balances'] = {};

    const accountBalancesResponse = await meanApiService.getAccountBalances({
      wallets,
      chainIds,
    });

    // Merging api balances with customToken balances
    const mergedBalances = cloneDeep(accountBalancesResponse.balances);
    const customTokens = getState().tokenLists.customTokens.tokens;

    for (const walletAddress of wallets) {
      const customTokensBalances = await sdkService.getMultipleBalances(customTokens, walletAddress);

      for (const [chainId, balanceList] of Object.entries(customTokensBalances)) {
        for (const [tokenAddress, balance] of Object.entries(balanceList)) {
          set(mergedBalances, [walletAddress, Number(chainId), tokenAddress], balance.toString());
        }
      }
    }

    for (const [walletAddress, chainBalances] of Object.entries(mergedBalances)) {
      for (const [chainIdString, tokenBalance] of Object.entries(chainBalances)) {
        const chainId = Number(chainIdString);

        for (const [tokenAddress, balance] of Object.entries(tokenBalance)) {
          try {
            const token = unwrapResult(
              await dispatch(
                fetchTokenDetails({
                  tokenAddress,
                  chainId: chainId,
                })
              )
            );

            set(
              parsedAccountBalances,
              [chainId, 'balancesAndPrices', tokenAddress, 'balances', walletAddress],
              BigInt(balance)
            );
            set(parsedAccountBalances, [chainId, 'balancesAndPrices', tokenAddress, 'token'], token);
          } catch (e) {
            console.error('Failed to parse token balance', tokenAddress, chainId, e);
          }
        }
      }
    }

    return parsedAccountBalances;
  }
);

export const updateTokensAfterTransaction = createAppAsyncThunk<
  void,
  { tokens: Token[]; chainId: number; walletAddress: string }
>(
  'balances/updateTokensAfterTransaction',
  ({ tokens, chainId, walletAddress }, { dispatch, extra: { web3Service } }) => {
    const meanApiService = web3Service.getMeanApiService();
    tokens.forEach((token) => {
      if (token.chainId !== chainId) {
        throw new Error('All tokens must belong to the same network');
      }
    });

    void dispatch(updateTokens({ chainId, tokens, walletAddress }));

    const cachedItems = tokens.map((token) => ({
      chain: token.chainId,
      address: walletAddress,
      token: token.address,
    }));
    void meanApiService.invalidateCacheForBalances(cachedItems);
  }
);

export const updateBalancesPeriodically = createAppAsyncThunk<
  void,
  { tokenListByChainId: TokenListByChainId; updateInterval: number }
>(
  'balances/updateBalancesPeriodically',
  async ({ tokenListByChainId, updateInterval }, { getState, dispatch, extra: { web3Service } }) => {
    const state = getState();
    const accountService = web3Service.getAccountService();

    const wallets = accountService.getWallets().map((wallet) => wallet.address);
    const { balances } = state.balances;

    const chainsWithBalance = Object.keys(balances).map(Number);
    const chainIds = getAllChains().map((chain) => chain.chainId);
    const orderedChainIds = union(chainsWithBalance, chainIds);

    const totalRequests = orderedChainIds.length * wallets.length;
    const delayBetweenRequests = updateInterval / totalRequests;

    const balancePromises: Promise<unknown>[] = [];
    orderedChainIds.forEach((chainId, index) => {
      wallets.forEach((walletAddress, walletIndex) => {
        const delay = (index * wallets.length + walletIndex) * delayBetweenRequests;
        const balancePromise = new Promise((resolve) => {
          setTimeout(() => {
            void dispatch(
              fetchWalletBalancesForChain({ chainId, walletAddress, tokenList: tokenListByChainId[chainId] })
            ).then(resolve);
          }, delay);
        });
        balancePromises.push(balancePromise);
      });
    });

    await Promise.all(balancePromises);
    void dispatch(fetchPricesForAllChains());
  }
);

export const fetchCustomTokenBalance = createAppAsyncThunk<
  Promise<Token | undefined>,
  { tokenAddress: Address; chainId: number }
>('balances/fetchCustomTokenBalance', async ({ tokenAddress, chainId }, { dispatch, extra: { web3Service } }) => {
  const accountService = web3Service.getAccountService();
  const wallets = accountService.getWallets();

  try {
    const token = await dispatch(fetchTokenDetails({ tokenAddress, chainId })).unwrap();
    const specificTokensPromises = wallets.map((wallet) =>
      dispatch(updateTokens({ tokens: [token], chainId, walletAddress: wallet.address }))
    );

    await Promise.all(specificTokensPromises);
    return token;
  } catch (e) {
    console.error('Failed to add custom token with balance', tokenAddress, chainId, e);
  }
});
