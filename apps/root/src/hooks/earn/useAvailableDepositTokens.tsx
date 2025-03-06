import { parseNumberUsdPriceToBigInt, parseUsdPrice, toToken } from '@common/utils/currency';
import { useAllBalances } from '@state/balances/hooks';
import { Address, AmountsOfToken, FarmId, Strategy, StrategyFarm, Token, TokenType } from '@types';
import React from 'react';
import useAllStrategies from './useAllStrategies';
import { formatUnits } from 'viem';
import useEarnService from './useEarnService';
import useTierLevel from '@hooks/tiers/useTierLevel';
import { compact, isNil, uniqBy } from 'lodash';
import usePriceService from '@hooks/usePriceService';
import useHasFetchedAllStrategies from './useHasFetchedAllStrategies';
import { bulkFetchSpecificTokensBalances } from '@state/balances/actions';
import { useAppDispatch } from '@state/hooks';
import useTokenList from '@hooks/useTokenList';
import { getTokenListId } from '@common/utils/parsing';

export interface TokenWithStrategy extends Token {
  strategy: Strategy;
}

export type FarmWithAvailableDepositTokens = {
  farm: StrategyFarm;
  token: Token;
  wallet: Address;
  strategies: Strategy[];
  balance: AmountsOfToken;
  id: FarmId;
  underlying: Token;
  underlyingAmount: AmountsOfToken;
};

export type FarmsWithAvailableDepositTokens = FarmWithAvailableDepositTokens[];

type DepositTokenWithBalance = {
  token: TokenWithStrategy;
  balances: [string, bigint][];
  price?: number;
};

type UnderlyingTokens = Record<string, { underlying: Token; underlyingAmount: string; price: number }>;

type State = {
  // The key is chainId-tokenAddress-amount
  resultsWithPrices: UnderlyingTokens;
  farmsWithDepositableTokens: FarmsWithAvailableDepositTokens;
};

const parseTokensWithBalanceToFarmsWithDepositableTokens = (
  depositTokensWithBalance: DepositTokenWithBalance[],
  underlyingTokens: UnderlyingTokens
) => {
  return Object.values(
    depositTokensWithBalance.reduce<Record<`${FarmId}-${Address}`, FarmWithAvailableDepositTokens>>(
      (acc, { token, balances, price }) => {
        balances.forEach(([walletAddress, balance]: [Address, bigint]) => {
          // eslint-disable-next-line no-param-reassign
          if (!acc[`${token.strategy.farm.id}-${walletAddress}`]) {
            const underlying = underlyingTokens[`${token.chainId}-${token.address}-${balance}`];
            if (!underlying) {
              return acc;
            }

            if (!underlying.price) {
              return acc;
            }
            const underlyingPrice = underlying.price;
            const underlyingToken = toToken({ ...underlying.underlying, price: underlyingPrice });
            const underlyingAmount = BigInt(underlying.underlyingAmount);
            const underlyingAmountUSD = parseUsdPrice(
              underlyingToken,
              underlyingAmount,
              parseNumberUsdPriceToBigInt(underlyingPrice)
            ).toFixed(2);
            const underlyingAmountUnits = formatUnits(underlyingAmount, underlyingToken.decimals);

            if (Number.isNaN(Number(underlyingAmountUSD)) || Number(underlyingAmountUSD) < 1) {
              return acc;
            }

            // eslint-disable-next-line no-param-reassign
            acc[`${token.strategy.farm.id}-${walletAddress}`] = {
              id: token.strategy.farm.id,
              farm: token.strategy.farm,
              token: { ...toToken({ ...token, price }) },
              wallet: walletAddress,
              strategies: [token.strategy],
              underlying: underlyingToken,
              underlyingAmount: {
                amount: underlyingAmount,
                amountInUSD: underlyingAmountUSD,
                amountInUnits: underlyingAmountUnits,
              },
              balance: {
                amount: balance,
                amountInUSD: parseUsdPrice(token, balance, parseNumberUsdPriceToBigInt(price)).toFixed(2),
                amountInUnits: formatUnits(balance, token.decimals),
              },
            };
          } else {
            // eslint-disable-next-line no-param-reassign
            acc[`${token.strategy.farm.id}-${walletAddress}`].strategies.push(token.strategy);
          }
        });

        return acc;
      },
      {}
    )
  );
};

const useAvailableDepositTokens = () => {
  const strategies = useAllStrategies();
  const isLoadingStrategies = !useHasFetchedAllStrategies();
  const fetchedInitialBalances = React.useRef(false);
  const dispatch = useAppDispatch();
  const completeTokenList = useTokenList({ curateList: false });

  const allBalances = useAllBalances();

  const earnService = useEarnService();

  const priceService = usePriceService();

  const { tierLevel } = useTierLevel();

  const [{ resultsWithPrices, farmsWithDepositableTokens }, setState] = React.useState<State>({
    resultsWithPrices: {},
    farmsWithDepositableTokens: [],
  });

  const depositTokens = React.useMemo(() => {
    if (isLoadingStrategies) return [];
    const depositTokenList = strategies
      .filter((strategy) => isNil(strategy.needsTier) || isNil(tierLevel) || strategy.needsTier <= tierLevel)
      .reduce<TokenWithStrategy[]>((acc, strategy) => {
        return acc.concat(
          strategy.depositTokens
            .filter((token) => token.type === TokenType.FARM)
            .map((token) => ({
              ...toToken({ ...token, chainId: strategy.network.chainId, type: TokenType.FARM }),
              strategy,
            }))
        );
      }, []);

    return uniqBy(depositTokenList, (token) => `${token.chainId}-${token.address}`);
  }, [strategies, tierLevel]);

  const depositTokensWithBalance = React.useMemo<DepositTokenWithBalance[]>(
    () =>
      depositTokens
        .filter((token) => {
          const chainBalancesAndPrices = allBalances.balances[token.chainId];
          if (!chainBalancesAndPrices) return false;

          const tokenBalances = chainBalancesAndPrices.balancesAndPrices[token.address];
          if (!tokenBalances) return false;

          const walletBalances = Object.entries(tokenBalances.balances).filter(([, balance]) => balance > 0n);
          return walletBalances.length > 0;
        })
        .map((token) => {
          const chainBalancesAndPrices = allBalances.balances[token.chainId];
          const tokenBalances = chainBalancesAndPrices.balancesAndPrices[token.address];
          const balances = Object.entries(tokenBalances.balances);
          return {
            token,
            balances,
            price: tokenBalances.price,
          };
        }),
    [depositTokens, allBalances]
  );

  const processFarmTokensBalances = React.useCallback(async () => {
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
    if (tokensToTransform.length === 0) return;

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

      setState((prev) => ({
        resultsWithPrices: { ...prev.resultsWithPrices, ...updatedResultsWithPrices },
        farmsWithDepositableTokens: parseTokensWithBalanceToFarmsWithDepositableTokens(depositTokensWithBalance, {
          ...prev.resultsWithPrices,
          ...updatedResultsWithPrices,
        }),
      }));
    } catch (e) {
      console.error(e);
    }
  }, [depositTokensWithBalance, earnService, priceService, resultsWithPrices, completeTokenList]);

  React.useEffect(() => {
    if (depositTokensWithBalance.length > 0 && !fetchedInitialBalances.current) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      processFarmTokensBalances();
      fetchedInitialBalances.current = true;
    }
  }, [depositTokensWithBalance, processFarmTokensBalances]);

  const updateFarmTokensBalances = React.useCallback(async () => {
    await dispatch(bulkFetchSpecificTokensBalances({ tokens: depositTokens, usingCuratedList: false }));
    await processFarmTokensBalances();
  }, [processFarmTokensBalances, dispatch, depositTokens]);

  return React.useMemo(
    () => ({ farmsWithDepositableTokens, updateFarmTokensBalances }),
    [farmsWithDepositableTokens, updateFarmTokensBalances]
  );
};

export default useAvailableDepositTokens;
