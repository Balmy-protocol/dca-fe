import { Address, CurrentPriceForChainResponse, Token, TokenList, TokenListByChainId, TokenListId } from '@types';
import { BalancesState, TokenBalancesAndPrices } from './reducer';
import { createAppAsyncThunk } from '@state/createAppAsyncThunk';
import { createAction, unwrapResult } from '@reduxjs/toolkit';

import { compact, groupBy, keyBy, set, union } from 'lodash';
import { fetchTokenDetails } from '@state/token-lists/actions';
import { getTokenListId, parseTokenList } from '@common/utils/parsing';
import { MAIN_NETWORKS } from '@constants';

import { getDepositTokensWithBalances } from '@common/utils/earn/parsing';
import {
  DepositTokenWithBalance,
  EarnDepositTokenUnderlyingTokens,
  TokenWithStrategy,
} from '@hooks/earn/useAvailableDepositTokens';

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
    priceResponse = await sdkService.sdk.priceService.getCurrentPricesInChain({
      chainId,
      tokens: storedTokenAddresses,
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
    const user = accountService.getUser();

    if (!user) {
      throw new Error('User is not connected');
    }

    const parsedAccountBalances: BalancesState['balances'] = {};

    const accountBalancesResponse = await accountService.fetchAccountBalances();

    const mergedBalances = accountBalancesResponse?.balances || {};
    const { byUrl: tokensLists, customTokens } = getState().tokenLists;

    const tokenList = parseTokenList({
      tokensLists: {
        ...tokensLists,
        'custom-tokens': customTokens,
      },
      // We allow all tokens to be in the balances redux state
      curateList: false,
    });

    for (const [walletAddress, chainBalances] of Object.entries(mergedBalances)) {
      for (const [chainIdString, tokenBalance] of Object.entries(chainBalances)) {
        const chainId = Number(chainIdString);

        for (const [tokenAddress, balance] of Object.entries(tokenBalance)) {
          try {
            const id = `${chainId}-${tokenAddress.toLowerCase()}` as TokenListId;
            let token = tokenList[id];

            if (!token) {
              token = unwrapResult(
                await dispatch(
                  fetchTokenDetails({
                    tokenAddress,
                    chainId: chainId,
                  })
                )
              );
            }

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
    const accountService = web3Service.getAccountService();

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

    void accountService.invalidateTokenBalances(cachedItems);
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
    const chainIds = Object.values(MAIN_NETWORKS).map((chain) => chain.chainId);
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

export const fetchSpecificTokensBalances = createAppAsyncThunk<
  Token[] | undefined,
  { tokenAddresses: Address[]; chainId: number; usingCuratedList?: boolean }
>(
  'balances/fetchSpecificTokensBalances',
  async ({ tokenAddresses, chainId, usingCuratedList = true }, { dispatch, getState, extra: { web3Service } }) => {
    const accountService = web3Service.getAccountService();
    const wallets = accountService.getWallets();

    const { byUrl: tokensLists, customTokens } = getState().tokenLists;

    const completeTokenList = parseTokenList({
      tokensLists: {
        ...tokensLists,
        'custom-tokens': customTokens,
      },
      chainId,
      curateList: usingCuratedList,
    });

    try {
      const tokenResults = await Promise.allSettled(
        tokenAddresses.map((tokenAddress) => {
          const id = `${chainId}-${tokenAddress.toLowerCase()}` as TokenListId;
          const token = completeTokenList[id];
          if (token) return token;

          return dispatch(fetchTokenDetails({ tokenAddress, chainId })).unwrap();
        })
      ).then((results) => results.map((result) => (result.status === 'fulfilled' ? result.value : undefined)));
      const tokens = compact(tokenResults);

      const specificTokensPromises = wallets.map((wallet) =>
        dispatch(updateTokens({ tokens, chainId, walletAddress: wallet.address }))
      );

      await Promise.allSettled(specificTokensPromises);
      return tokens;
    } catch (e) {
      console.error('Failed to fetch specific tokens balances', tokenAddresses, chainId, e);
    }
  }
);

export const bulkFetchSpecificTokensBalances = createAppAsyncThunk<
  void,
  { tokens: Token[]; usingCuratedList?: boolean }
>('balances/bulkFetchSpecificTokensBalances', async ({ tokens, usingCuratedList = true }, { dispatch }) => {
  const tokensByChain = groupBy(tokens, 'chainId');
  const promises = Object.entries(tokensByChain).map(([chainId, sameChainTokens]) =>
    dispatch(
      fetchSpecificTokensBalances({
        tokenAddresses: sameChainTokens.map((token) => token.address),
        chainId: Number(chainId),
        usingCuratedList,
      })
    )
  );
  await Promise.allSettled(promises);
});

export const updateAndParseEarnDepositTokenBalances = createAppAsyncThunk<
  | {
      depositTokensWithBalance: DepositTokenWithBalance[];
      updatedResultsWithPrices: EarnDepositTokenUnderlyingTokens;
    }
  | undefined,
  {
    depositTokens: TokenWithStrategy[];
    resultsWithPrices: EarnDepositTokenUnderlyingTokens;
    shouldUpdateBalances?: boolean;
  }
>(
  'balances/updateAndParseEarnDepositTokenBalances',
  async (
    { depositTokens, resultsWithPrices, shouldUpdateBalances = true },
    { dispatch, getState, extra: { web3Service } }
  ) => {
    const earnService = web3Service.getEarnService();
    const priceService = web3Service.getPriceService();

    if (shouldUpdateBalances) {
      await dispatch(bulkFetchSpecificTokensBalances({ tokens: depositTokens }));
    }

    // Now we get the recent balances that where just updated
    const { balances: updatedAllBalances, tokenLists } = getState();

    const depositTokensWithBalance = getDepositTokensWithBalances(depositTokens, updatedAllBalances);

    const tokensToTransform = depositTokensWithBalance
      .reduce(
        (acc, { token, balances }) => {
          balances.forEach(([, balance]) => {
            acc.push({ token, amount: balance });
          });
          return acc;
        },
        [] as { token: Token; amount: bigint }[]
      )
      // Exclude tokens that have already been transformed
      .filter(
        ({ token, amount }) =>
          !Object.keys(resultsWithPrices).includes(`${token.chainId}-${token.address}-${amount}`) && amount > 0n
      );
    if (tokensToTransform.length === 0)
      return {
        depositTokensWithBalance,
        updatedResultsWithPrices: {},
      };

    const { byUrl: tokensLists, customTokens } = tokenLists;
    const completeTokenList = parseTokenList({
      tokensLists: {
        ...tokensLists,
        'custom-tokens': customTokens,
      },
      curateList: false,
    });

    try {
      const response = await earnService.transformVaultTokensToUnderlying(tokensToTransform);
      const underlyingTokens = tokensToTransform.map(({ token, amount }) => {
        const underlying = response[`${token.chainId}-${token.address}-${amount}`];
        if (!underlying) {
          return null;
        }
        return completeTokenList[getTokenListId({ tokenAddress: underlying.underlying, chainId: token.chainId })];
      });
      const priceResponse = await priceService.getUsdCurrentPrices(compact(underlyingTokens));
      const updatedResultsWithPrices = Object.fromEntries(
        compact(
          Object.entries(response).map(([key, value]) => {
            const underlyingChainId = underlyingTokens.find((token) => token?.address === value.underlying)?.chainId;
            if (!underlyingChainId) return null;

            const chainPrices = priceResponse[underlyingChainId];
            if (!chainPrices) return null;

            const underlyingPrice = chainPrices[value.underlying];
            if (!underlyingPrice) return null;

            const underlyingToken =
              completeTokenList[getTokenListId({ tokenAddress: value.underlying, chainId: underlyingChainId })];
            if (!underlyingToken) return null;

            return [
              key,
              { underlying: underlyingToken, underlyingAmount: value.underlyingAmount, price: underlyingPrice.price },
            ];
          })
        )
      );

      return {
        depositTokensWithBalance,
        updatedResultsWithPrices,
      };
    } catch (e) {
      console.error(e);
    }
  }
);
