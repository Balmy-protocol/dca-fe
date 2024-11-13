import { toToken } from '@common/utils/currency';
import { useAllBalances } from '@state/balances/hooks';
import { Address, FarmId, Token, TokenType } from '@types';
import React from 'react';
import useAllStrategies from './useAllStrategies';

interface TokenWithFarm extends Token {
  farm: FarmId;
}

const useAvailableDepositTokens = () => {
  const strategies = useAllStrategies();

  const allBalances = useAllBalances();

  const tokensWithBalance = React.useMemo(() => {
    const tokens = strategies.reduce<TokenWithFarm[]>((acc, strategy) => {
      return acc.concat(
        strategy.depositTokens
          .filter((token) => token.type === TokenType.FARM)
          .map((token) => ({
            ...toToken({ ...token, chainId: strategy.network.chainId, type: TokenType.FARM }),
            farm: strategy.farm.id,
          }))
      );
    }, []);

    return tokens.reduce<{ wallet: Address; token: TokenWithFarm }[]>((acc, token) => {
      const chainBalancesAndPrices = allBalances.balances[token.chainId];
      if (!chainBalancesAndPrices) {
        return acc;
      }
      const tokenBalances = chainBalancesAndPrices.balancesAndPrices[token.address];

      if (!tokenBalances) {
        return acc;
      }

      const balances = tokenBalances.balances;
      if (balances && Object.values(balances).some((balance) => balance > 0)) {
        acc.push({
          wallet: token.address,
          token: { ...toToken({ ...token, price: tokenBalances.price }), farm: token.farm },
        });
      }
      return acc;
    }, []);
  }, [allBalances, strategies]);

  return tokensWithBalance;
};

export default useAvailableDepositTokens;
