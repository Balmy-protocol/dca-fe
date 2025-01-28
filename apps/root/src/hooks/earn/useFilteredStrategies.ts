import React from 'react';
import { useStrategiesFilters } from '@state/strategies-filters/hooks';
import { getIsSameOrTokenEquivalent } from '@common/utils/currency';
import { searchByStrategyData } from '@common/utils/earn/search';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { EarnPosition, FarmId } from 'common-types';
import { StrategyColumnConfig } from '@pages/earn/components/strategies-table/components/columns';
import { StrategyWithWalletBalanceAndTierLevel } from '@pages/earn/components/strategies-table';
import { getComparator } from '@common/utils/earn/sort';
import useTierLevel from '@hooks/tiers/useTierLevel';

const isEarnPosition = (
  obj: StrategyWithWalletBalanceAndTierLevel | EarnPosition[],
  variant: StrategiesTableVariants
): obj is EarnPosition[] => variant === StrategiesTableVariants.USER_STRATEGIES;

type VariantBasedReturnType<V> = V extends StrategiesTableVariants.ALL_STRATEGIES
  ? StrategyWithWalletBalanceAndTierLevel[]
  : EarnPosition[][];

export default function useFilteredStrategies<V extends StrategiesTableVariants>({
  columns,
  strategies,
  variant,
  filterTierLevel = false,
}: {
  columns: StrategyColumnConfig<V>[];
  strategies: StrategyWithWalletBalanceAndTierLevel[] | EarnPosition[][];
  variant: V;
  filterTierLevel?: boolean;
}) {
  const filtersApplied = useStrategiesFilters(variant);
  const { tierLevel } = useTierLevel();

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
        filtersApplied.protocols.length === 0 || filtersApplied.protocols.includes(strategy.farm.protocol);

      const isGuardiansMatch =
        filtersApplied.guardians.length === 0 || filtersApplied.guardians.includes(strategy.guardian?.id || '');

      return isAssetMatch && isRewardMatch && isNetworkMatch && isYieldTypeMatch && isProtocolMatch && isGuardiansMatch;
    });

    let filteredStrategiesBySearch = filteredStrategies.filter((strategy) =>
      searchByStrategyData(isEarnPosition(strategy, variant) ? strategy[0].strategy : strategy, filtersApplied.search)
    );

    if (variant === StrategiesTableVariants.ALL_STRATEGIES && filterTierLevel) {
      const farmsByStrategy: Record<FarmId, StrategyWithWalletBalanceAndTierLevel[]> = {};

      filteredStrategiesBySearch.forEach((strategy) => {
        if (isEarnPosition(strategy, variant)) {
          return;
        }
        const farmId = strategy.farm.id;
        farmsByStrategy[farmId] = [...(farmsByStrategy[farmId] || []), strategy];
      });

      const farms = Object.keys(farmsByStrategy);

      const filteredStrategiesByTierLevel: StrategyWithWalletBalanceAndTierLevel[] = [];
      farms.forEach((farmId: FarmId) => {
        const farmStrategies = farmsByStrategy[farmId];

        // Now we fetch the strategy that matches the user tier level
        const strategyTier = farmStrategies.find((strategy) => strategy.needsTier === tierLevel);
        let tierToUseToFilter = strategyTier?.needsTier;

        // If there is not strategy that matches the user tier level, we want to grab the first strategy that the user can access
        if (!tierToUseToFilter) {
          // Sort the strategies by tier level descending
          const sortedByTier = farmStrategies.sort((a, b) => (b.needsTier ?? 0) - (a.needsTier ?? 0));
          // Now I want to grab the first strategy that the user can access
          const firstStrategy = sortedByTier.find((strategy) => (strategy.needsTier ?? 0) <= (tierLevel ?? 0));
          tierToUseToFilter = firstStrategy?.needsTier ?? 0;
        }

        // Now we filter all strategies that are below the minAvailableTier
        // We also always want to show tier 2 and 3 strategies
        const filteredTierLevelStrategies = farmStrategies.filter(
          (strategy) =>
            (strategy.needsTier ?? 0) >= tierToUseToFilter || strategy.needsTier === 2 || strategy.needsTier === 3
        );
        filteredStrategiesByTierLevel.push(...filteredTierLevelStrategies);
      });

      filteredStrategiesBySearch = filteredStrategiesByTierLevel;
    }

    const sortedStrategies = filteredStrategiesBySearch.slice().sort(
      getComparator({
        columns,
        primaryOrder: filtersApplied.orderBy,
        secondaryOrder: filtersApplied.secondaryOrderBy,
        tertiaryOrder: filtersApplied.tertiaryOrderBy,
        quarterOrder: filtersApplied.quarterOrderBy,
      }) as (
        a: StrategyWithWalletBalanceAndTierLevel | EarnPosition[],
        b: StrategyWithWalletBalanceAndTierLevel | EarnPosition[]
      ) => number
    );

    return sortedStrategies as VariantBasedReturnType<V>;
  }, [strategies, filtersApplied, variant, filterTierLevel, tierLevel]);
}
