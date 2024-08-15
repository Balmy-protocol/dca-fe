import React from 'react';
import { useAllBalances } from '@state/balances/hooks';
import useAllStrategies from './useAllStrategies';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { TableStrategy } from '@pages/earn/components/strategies-table';
import { formatUnits } from 'viem';
import { isUndefined } from 'lodash';
import { parseNumberUsdPriceToBigInt, parseUsdPrice } from '@common/utils/currency';

const variant = StrategiesTableVariants.ALL_STRATEGIES;

export default function useAllStrategiesForTable(): TableStrategy<typeof variant>[] {
  const strategies = useAllStrategies();
  const allBalances = useAllBalances();
  const strategiesWithWalletBalance = React.useMemo(
    () =>
      strategies.map((strategy) => {
        const walletBalances =
          allBalances.balances[strategy.farm.chainId]?.balancesAndPrices[strategy.asset.address]?.balances;
        const totalAmount = Object.values(walletBalances || {}).reduce((acc, balance) => acc + balance, 0n);

        return {
          ...strategy,
          walletBalance: {
            amount: totalAmount,
            amountInUnits: formatUnits(totalAmount, strategy.asset.decimals),
            amountInUSD: isUndefined(strategy.asset.price)
              ? undefined
              : parseUsdPrice(strategy.asset, totalAmount, parseNumberUsdPriceToBigInt(strategy.asset.price)).toFixed(
                  2
                ),
          },
        };
      }),
    [strategies, allBalances.balances]
  );

  return strategiesWithWalletBalance;
}
