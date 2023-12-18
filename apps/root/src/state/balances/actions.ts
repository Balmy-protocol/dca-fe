import { CurrentPriceForChainResponse, Token, TokenList, TokenListByChainId, TokenType } from '@types';
import { BalancesState, TokenBalancesAndPrices } from './reducer';
import { createAppAsyncThunk } from '@state/createAppAsyncThunk';
import { unwrapResult } from '@reduxjs/toolkit';

import { keyBy, set, union } from 'lodash';
import { toToken } from '@common/utils/currency';
import { addCustomToken } from '@state/token-lists/actions';

export const fetchWalletBalancesForChain = createAppAsyncThunk<
  { chainId: number; tokenBalances: TokenBalancesAndPrices; walletAddress: string },
  { tokenList: TokenList; chainId: number; walletAddress: string }
>('balances/fetchWalletBalancesForChain', async ({ tokenList, chainId, walletAddress }, { extra: { web3Service } }) => {
  const sdkService = web3Service.getSdkService();
  const tokens = Object.values(tokenList);

  const balances = await sdkService.getMultipleBalances(tokens, walletAddress);

  const tokenBalances = Object.entries(balances[chainId]).reduce<TokenBalancesAndPrices>(
    (acc, [tokenAddress, balance]) => {
      if (balance > 0n) {
        return {
          ...acc,
          [tokenAddress]: {
            token: tokenList[tokenAddress],
            balances: {
              [walletAddress]: balance,
            },
          },
        };
      }
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
  const storedTokenAddresses = Object.values(state.balances[chainId].balancesAndPrices || {}).map(
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
    const { isLoadingAllBalances, ...allBalances } = state.balances;
    const pricePromises = Object.keys(allBalances).map((chainId) =>
      dispatch(fetchPricesForChain({ chainId: Number(chainId) }))
    );
    await Promise.all(pricePromises);
  }
);

const fetchTokenDetails = createAppAsyncThunk<
  Token,
  { tokenAddress: string; chainId: number; walletAddress: string; tokenList: TokenList }
>(
  'balances/fetchTokenDetails',
  async ({ tokenAddress, chainId, walletAddress, tokenList }, { dispatch, extra: { web3Service } }) => {
    if (tokenList[tokenAddress]) {
      return tokenList[tokenAddress];
    }
    const tokenContract = await web3Service.contractService.getERC20TokenInstance(chainId, tokenAddress, walletAddress);
    const [name, symbol, decimals] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
    ]);

    const customToken = toToken({
      address: tokenAddress,
      name,
      symbol,
      decimals,
      chainId,
      type: TokenType.ERC20_TOKEN,
    });

    dispatch(addCustomToken(customToken));
    return customToken;
  }
);

export const fetchInitialBalances = createAppAsyncThunk<
  Omit<BalancesState, 'isLoadingAllBalances'>,
  { tokenListByChainId: TokenListByChainId }
>('balances/fetchInitialBalances', async ({ tokenListByChainId }, { dispatch, extra: { web3Service } }) => {
  const accountService = web3Service.getAccountService();
  const meanApiService = web3Service.getMeanApiService();
  const chainIds = Object.keys(tokenListByChainId).map((chainId) => Number(chainId));
  const wallets = accountService.getWallets().map((wallet) => wallet.address);

  const accountBalancesResponse = await meanApiService.getAccountBalances({
    wallets,
    chainIds,
  });
  const parsedAccountBalances: Omit<BalancesState, 'isLoadingAllBalances'> = {};

  for (const [walletAddress, chainBalances] of Object.entries(accountBalancesResponse.balances)) {
    for (const [chainIdString, tokenBalance] of Object.entries(chainBalances)) {
      const chainId = Number(chainIdString);

      for (const [tokenAddress, balance] of Object.entries(tokenBalance)) {
        const token = unwrapResult(
          await dispatch(
            fetchTokenDetails({
              tokenAddress,
              chainId: chainId,
              walletAddress,
              tokenList: tokenListByChainId[chainId],
            })
          )
        );

        set(
          parsedAccountBalances,
          [chainId, 'balancesAndPrices', tokenAddress, 'balances', walletAddress],
          BigNumber.from(balance)
        );
        set(parsedAccountBalances, [chainId, 'balancesAndPrices', tokenAddress, 'token'], token);
      }
    }
  }

  return parsedAccountBalances;
});

export const updateTokens = createAppAsyncThunk<void, { tokens: Token[]; chainId: number; walletAddress: string }>(
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
      chainId: token.chainId,
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
    const { isLoadingAllBalances, ...allBalances } = state.balances;

    const chainsWithBalance = Object.keys(allBalances).map(Number);
    const chainIds = Object.keys(tokenListByChainId).map(Number);
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
