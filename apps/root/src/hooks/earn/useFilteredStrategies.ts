import React from 'react';
import useAllStrategies from '@hooks/earn/useAllStrategies';
import { useAllStrategiesFilters } from '@state/all-strategies-filters/hooks';
import { getIsSameOrTokenEquivalent } from '@common/utils/currency';
import { filterStrategiesBySearch } from '@common/utils/earn/search';

export default function useFilteredStrategies() {
  const { strategies, hasFetchedAllStrategies } = useAllStrategies();
  const filtersApplied = useAllStrategiesFilters();

  return React.useMemo(() => {
    const filteredStrategies = strategies.filter((strategy) => {
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

    const filteredStrategiesBySearch = filterStrategiesBySearch(filteredStrategies, filtersApplied.search);

    return {
      strategies: filteredStrategiesBySearch,
      hasFetchedAllStrategies,
    };
  }, [strategies, filtersApplied, hasFetchedAllStrategies]);
}
