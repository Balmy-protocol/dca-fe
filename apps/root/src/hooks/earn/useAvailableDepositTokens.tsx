import { parseBaseUsdPriceToNumber, parseNumberUsdPriceToBigInt, parseUsdPrice, toToken } from '@common/utils/currency';
import { useAllBalances } from '@state/balances/hooks';
import { Address, AmountsOfToken, FarmId, Strategy, StrategyFarm, Token, TokenType } from '@types';
import React from 'react';
import useAllStrategies from './useAllStrategies';
import { formatUnits } from 'viem';
import useEarnService from './useEarnService';
import useTierLevel from '@hooks/tiers/useTierLevel';
import { compact, isNil } from 'lodash';
import usePriceService from '@hooks/usePriceService';

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

const useAvailableDepositTokens = ({ filterSmallValues = false }: { filterSmallValues?: boolean } = {}) => {
  const strategies = useAllStrategies();

  const allBalances = useAllBalances();

  const earnService = useEarnService();

  const priceService = usePriceService();

  const { tierLevel } = useTierLevel();

  const [{ result, isLoading }, setState] = React.useState<{
    isLoading: boolean;
    // The key is chainId-tokenAddress-amount
    result: Record<string, { underlying: string; underlyingAmount: string; price: bigint }>;
  }>({ isLoading: false, result: {} });

  const depositTokens = React.useMemo(() => {
    return strategies
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
  }, [strategies]);

  const depositTokensWithBalance = React.useMemo(() => {
    return depositTokens
      .filter((token) => {
        const chainBalancesAndPrices = allBalances.balances[token.chainId];
        if (!chainBalancesAndPrices) {
          return false;
        }
        const tokenBalances = chainBalancesAndPrices.balancesAndPrices[token.address];

        if (!tokenBalances) {
          return false;
        }

        const price = tokenBalances.price;
        const walletBalances = Object.entries(tokenBalances.balances).filter(([, balance]) => {
          if (filterSmallValues) {
            const amountInUSD = parseUsdPrice(token, balance, parseNumberUsdPriceToBigInt(price));
            return amountInUSD > 1;
          }
          return balance > 0n;
        });

        return walletBalances.length > 0;
      })
      .map((token) => {
        const chainBalancesAndPrices = allBalances.balances[token.chainId];
        const tokenBalances = chainBalancesAndPrices.balancesAndPrices[token.address];
        const balances = tokenBalances.balances;
        const walletBalances = Object.entries(balances).filter(([, balance]) => balance > 0n);
        return {
          token,
          balances: walletBalances,
          price: tokenBalances.price,
        };
      });
  }, [depositTokens, allBalances]);

  React.useEffect(() => {
    async function callPromise() {
      const tokensToTransform = depositTokensWithBalance.reduce(
        (acc, { token, balances }) => {
          balances.forEach(([, balance]) => {
            acc.push({ token, amount: balance });
          });
          return acc;
        },
        [] as { token: Token; amount: bigint }[]
      );
      try {
        const response = await earnService.transformVaultTokensToUnderlying(tokensToTransform);
        const underlyingTokens = tokensToTransform.map(({ token, amount }) => {
          console.log(response, token, amount);
          const underlying = response[`${token.chainId}-${token.address}-${amount}`];
          if (!underlying) {
            return null;
          }
          return toToken({ address: underlying.underlying, chainId: token.chainId });
        });
        console.log(underlyingTokens);
        const priceResponse = await priceService.getUsdHistoricPrice(compact(underlyingTokens));
        console.log(priceResponse);
        const reultsWithPrice = Object.fromEntries(
          Object.entries(response).map(([key, value]) => {
            return [key, { ...value, price: priceResponse[value.underlying] }];
          })
        );
        setState({ result: reultsWithPrice, isLoading: false });
      } catch (e) {
        console.error(e);
      }
    }
    if (depositTokensWithBalance.length > 0 && !isLoading) {
      setState({ isLoading: true, result: {} });
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [depositTokensWithBalance]);

  const tokensWithBalance = React.useMemo(() => {
    return Object.values(
      depositTokensWithBalance.reduce<Record<`${FarmId}-${Address}`, FarmWithAvailableDepositTokens>>(
        (acc, { token, balances, price }) => {
          balances.forEach(([walletAddress, balance]: [Address, bigint]) => {
            // eslint-disable-next-line no-param-reassign
            if (!acc[`${token.strategy.farm.id}-${walletAddress}`]) {
              const underlying = result[`${token.chainId}-${token.address}-${balance}`];
              if (!underlying) {
                return acc;
              }

              if (!underlying.price) {
                return acc;
              }
              const underlyingPrice = underlying.price;
              const underlyingToken = toToken({
                address: underlying.underlying,
                price: parseBaseUsdPriceToNumber(underlyingPrice),
                chainId: token.chainId,
                decimals: token.decimals,
              });
              const underlyingAmount = BigInt(underlying.underlyingAmount);
              const underlyingAmountUSD = parseUsdPrice(underlyingToken, underlyingAmount, underlyingPrice).toFixed(2);
              const underlyingAmountUnits = formatUnits(underlyingAmount, underlyingToken.decimals);
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
  }, [allBalances, depositTokens, result]);

  return tokensWithBalance;
};

export default useAvailableDepositTokens;
