import { parseNumberUsdPriceToBigInt, parseUsdPrice, toToken } from '@common/utils/currency';
import { useAllBalances } from '@state/balances/hooks';
import { Address, AmountsOfToken, FarmId, Strategy, StrategyFarm, Token, TokenType } from '@types';
import React from 'react';
import useAllStrategies from './useAllStrategies';
import { formatUnits } from 'viem';
import useEarnService from './useEarnService';
import useTierLevel from '@hooks/tiers/useTierLevel';
import { isNil } from 'lodash';

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

const useAvailableDepositTokens = () => {
  const strategies = useAllStrategies();

  const allBalances = useAllBalances();

  const earnService = useEarnService();

  const { tierLevel } = useTierLevel();

  const [{ result, isLoading }, setState] = React.useState<{
    isLoading: boolean;
    // The key is chainId-tokenAddress-amount
    result: Record<string, { underlying: string; underlyingAmount: string }>;
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

        const walletBalances = Object.entries(tokenBalances.balances).filter(([, balance]) => balance > 0n);

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
        setState({ result: response, isLoading: false });
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
              const chainBalancesAndPrices = allBalances.balances[token.chainId];
              if (!chainBalancesAndPrices) {
                return false;
              }
              const tokenBalances = chainBalancesAndPrices.balancesAndPrices[underlying.underlying as Address];

              if (!tokenBalances) {
                return false;
              }
              const underlyingPrice = tokenBalances.price;
              const underlyingToken = toToken({ ...tokenBalances.token, chainId: token.chainId, type: TokenType.FARM });
              const underlyingAmount = BigInt(underlying.underlyingAmount);
              const underlyingAmountUSD = parseUsdPrice(
                underlyingToken,
                underlyingAmount,
                parseNumberUsdPriceToBigInt(underlyingPrice)
              ).toFixed(2);
              const underlyingAmountUnits = formatUnits(underlyingAmount, tokenBalances.token.decimals);
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
