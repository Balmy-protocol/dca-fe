import React from 'react';
import { useStrategiesFilters } from '@state/strategies-filters/hooks';
import { getIsSameOrTokenEquivalent } from '@common/utils/currency';
import { searchByStrategyData } from '@common/utils/earn/search';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { getComparator } from '@common/utils/earn/parsing';
import { EarnPosition, Strategy } from 'common-types';

const isEarnPosition = (obj: Strategy | EarnPosition): obj is EarnPosition => 'strategy' in obj;

type VariantBasedReturnType<V> = V extends StrategiesTableVariants.ALL_STRATEGIES ? Strategy[] : EarnPosition[];

export default function useFilteredStrategies<V extends StrategiesTableVariants>({
  strategies,
  variant,
}: {
  strategies: Strategy[] | EarnPosition[];
  variant: V;
}) {
  const filtersApplied = useStrategiesFilters(variant);

  return React.useMemo(() => {
    const filteredStrategies = strategies.filter((strategyObj) => {
      const strategy = isEarnPosition(strategyObj) ? strategyObj.strategy : strategyObj;

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

      const isFarmMatch = filtersApplied.farms.length === 0 || filtersApplied.farms.includes(strategy.farm.id);

      const isGuardiansMatch =
        filtersApplied.guardians.length === 0 || filtersApplied.guardians.includes(strategy.guardian?.id || '');

      return isAssetMatch && isRewardMatch && isNetworkMatch && isYieldTypeMatch && isFarmMatch && isGuardiansMatch;
    });

    const filteredStrategiesBySearch = filteredStrategies.filter((strategy) =>
      searchByStrategyData(isEarnPosition(strategy) ? strategy.strategy : strategy, filtersApplied.search)
    );

    const sortedStrategies = filteredStrategiesBySearch
      .slice()
      .sort(getComparator(filtersApplied.orderBy.order, filtersApplied.orderBy.column));

    return sortedStrategies as VariantBasedReturnType<V>;
  }, [strategies, filtersApplied, variant]);
}
