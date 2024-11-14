import { parseNumberUsdPriceToBigInt, parseUsdPrice, toToken } from '@common/utils/currency';
import { useAllBalances } from '@state/balances/hooks';
import { Address, AmountsOfToken, FarmId, Strategy, StrategyFarm, Token, TokenType } from '@types';
import React from 'react';
import useAllStrategies from './useAllStrategies';
import { formatUnits } from 'viem';

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
};

export type FarmsWithAvailableDepositTokens = FarmWithAvailableDepositTokens[];

const useAvailableDepositTokens = () => {
  const strategies = useAllStrategies();

  const allBalances = useAllBalances();

  const tokensWithBalance = React.useMemo(() => {
    const tokens = strategies.reduce<TokenWithStrategy[]>((acc, strategy) => {
      return acc.concat(
        strategy.depositTokens
          .filter((token) => token.type === TokenType.FARM)
          .map((token) => ({
            ...toToken({ ...token, chainId: strategy.network.chainId, type: TokenType.FARM }),
            strategy,
          }))
      );
    }, []);

    return Object.values(
      tokens.reduce<Record<`${FarmId}-${Address}`, FarmWithAvailableDepositTokens>>((acc, token) => {
        const chainBalancesAndPrices = allBalances.balances[token.chainId];
        if (!chainBalancesAndPrices) {
          return acc;
        }
        const tokenBalances = chainBalancesAndPrices.balancesAndPrices[token.address];

        if (!tokenBalances) {
          return acc;
        }

        const balances = tokenBalances.balances;
        const walletBalances = Object.entries(balances).filter(([, balance]) => balance > 0);

        walletBalances.forEach(([walletAddress, balance]: [Address, bigint]) => {
          // eslint-disable-next-line no-param-reassign
          if (!acc[`${token.strategy.farm.id}-${walletAddress}`]) {
            // eslint-disable-next-line no-param-reassign
            acc[`${token.strategy.farm.id}-${walletAddress}`] = {
              id: token.strategy.farm.id,
              farm: token.strategy.farm,
              token: { ...toToken({ ...token, price: tokenBalances.price }) },
              wallet: walletAddress,
              strategies: [token.strategy],
              balance: {
                amount: balance,
                amountInUSD: parseUsdPrice(token, balance, parseNumberUsdPriceToBigInt(tokenBalances.price)).toFixed(2),
                amountInUnits: formatUnits(balance, token.decimals),
              },
            };
          }
          // eslint-disable-next-line no-param-reassign
          acc[`${token.strategy.farm.id}-${walletAddress}`].strategies.push(token.strategy);
        });

        return acc;
      }, {})
    );
  }, [allBalances, strategies]);

  return tokensWithBalance;
};

export default useAvailableDepositTokens;
