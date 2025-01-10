import React from 'react';
import { useStrategiesFilters } from '@state/strategies-filters/hooks';
import { getIsSameOrTokenEquivalent } from '@common/utils/currency';
import { searchByStrategyData } from '@common/utils/earn/search';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { EarnPosition } from 'common-types';
import { StrategyColumnConfig } from '@pages/earn/components/strategies-table/components/columns';
import { StrategyWithWalletBalance } from '@pages/earn/components/strategies-table';
import { getComparator } from '@common/utils/earn/sort';

const isEarnPosition = (
  obj: StrategyWithWalletBalance | EarnPosition[],
  variant: StrategiesTableVariants
): obj is EarnPosition[] => variant === StrategiesTableVariants.USER_STRATEGIES;

type VariantBasedReturnType<V> = V extends StrategiesTableVariants.ALL_STRATEGIES
  ? StrategyWithWalletBalance[]
  : EarnPosition[][];

export default function useFilteredStrategies<V extends StrategiesTableVariants>({
  columns,
  strategies,
  variant,
}: {
  columns: StrategyColumnConfig<V>[];
  strategies: StrategyWithWalletBalance[] | EarnPosition[][];
  variant: V;
}) {
  const filtersApplied = useStrategiesFilters(variant);

  return React.useMemo(() => {
    const filteredStrategies = strategies.filter((strategyObj) => {
      const strategy = isEarnPosition(strategyObj, variant) ? strategyObj[0].strategy : strategyObj;

      const isAssetMatch =
        filtersApplied.assets.length === 0 ||
        filtersApplied.assets.some((asset) => getIsSameOrTokenEquivalent(asset, strategy.asset));

      const isRewardMatch =
        filtersApplied.rewards.length === 0 ||
        filtersApplied.rewards.some((reward) =>
          strategy.rewards.tokens.some((strategyReward) => getIsSameOrTokenEquivalent(reward, strategyReward))
        );

      const isNetworkMatch =
        filtersApplied.networks.length === 0 || filtersApplied.networks.includes(strategy.network.chainId);

      const isYieldTypeMatch =
        filtersApplied.yieldTypes.length === 0 || filtersApplied.yieldTypes.includes(strategy.farm.type);

      const isProtocolMatch =
        filtersApplied.protocols.length === 0 || filtersApplied.protocols.includes(strategy.farm.name);

      const isGuardiansMatch =
        filtersApplied.guardians.length === 0 || filtersApplied.guardians.includes(strategy.guardian?.id || '');

      return isAssetMatch && isRewardMatch && isNetworkMatch && isYieldTypeMatch && isProtocolMatch && isGuardiansMatch;
    });

    const filteredStrategiesBySearch = filteredStrategies.filter((strategy) =>
      searchByStrategyData(isEarnPosition(strategy, variant) ? strategy[0].strategy : strategy, filtersApplied.search)
    );
    const sortedStrategies = filteredStrategiesBySearch.slice().sort(
      getComparator({
        columns,
        primaryOrder: filtersApplied.orderBy,
        secondaryOrder: filtersApplied.secondaryOrderBy,
        tertiaryOrder: filtersApplied.tertiaryOrderBy,
        quarterOrder: filtersApplied.quarterOrderBy,
      }) as (a: StrategyWithWalletBalance | EarnPosition[], b: StrategyWithWalletBalance | EarnPosition[]) => number
    );

    return sortedStrategies as VariantBasedReturnType<V>;
  }, [strategies, filtersApplied, variant]);
}
