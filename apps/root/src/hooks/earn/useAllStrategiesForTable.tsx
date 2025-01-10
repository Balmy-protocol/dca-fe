import React from 'react';
import { useAllBalances } from '@state/balances/hooks';
import useAllStrategies from './useAllStrategies';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { TableStrategy } from '@pages/earn/components/strategies-table';
import { formatUnits } from 'viem';
import { isUndefined } from 'lodash';
import { parseNumberUsdPriceToBigInt, parseUsdPrice } from '@common/utils/currency';
import useTierLevel from '@hooks/tiers/useTierLevel';

const variant = StrategiesTableVariants.ALL_STRATEGIES;

export default function useAllStrategiesForTable(): TableStrategy<typeof variant>[] {
  const strategies = useAllStrategies();
  const allBalances = useAllBalances();
  const { tierLevel } = useTierLevel();
  const strategiesWithWalletBalanceAndTierLevel = React.useMemo(
    () =>
      strategies.map((strategy) => {
        const tokenInfo = allBalances.balances[strategy.network.chainId]?.balancesAndPrices[strategy.asset.address];
        const totalAmount = Object.values(tokenInfo?.balances || {}).reduce((acc, balance) => acc + balance, 0n);

        const price = tokenInfo?.price ?? strategy.asset.price;

        return {
          ...strategy,
          walletBalance: {
            amount: totalAmount,
            amountInUnits: formatUnits(totalAmount, strategy.asset.decimals),
            amountInUSD: isUndefined(price)
              ? undefined
              : parseUsdPrice(strategy.asset, totalAmount, parseNumberUsdPriceToBigInt(price)).toFixed(2),
          },
          tierLevel,
        };
      }),
    [strategies, allBalances.balances]
  );

  return strategiesWithWalletBalanceAndTierLevel;
}
