import { StrategyColumnKeys } from '@pages/earn/components/strategies-table/components/columns';
import { createAction } from '@reduxjs/toolkit';
import { ChainId, FarmId, GuardianId, StrategyYieldType, Token } from 'common-types';
import { ColumnOrder, StrategiesTableVariants } from './reducer';

export const setAssetFilter = createAction<{ variant: StrategiesTableVariants; value: Token[] }>(
  'strategiesFilters/setAssetFilter'
);

export const setNetworkFilter = createAction<{ variant: StrategiesTableVariants; value: ChainId[] }>(
  'strategiesFilters/setNetworkFilter'
);

export const setRewardFilter = createAction<{ variant: StrategiesTableVariants; value: Token[] }>(
  'strategiesFilters/setRewardFilter'
);

export const setFarmFilter = createAction<{ variant: StrategiesTableVariants; value: FarmId[] }>(
  'strategiesFilters/setFarmFilter'
);

export const setGuardianFilter = createAction<{ variant: StrategiesTableVariants; value: GuardianId[] }>(
  'strategiesFilters/setGuardianFilter'
);

export const setYieldTypeFilter = createAction<{ variant: StrategiesTableVariants; value: StrategyYieldType[] }>(
  'strategiesFilters/setYieldTypeFilter'
);

export const setSearch = createAction<{ variant: StrategiesTableVariants; value: string }>(
  'strategiesFilters/setSearch'
);

export const setOrderBy = createAction<{
  variant: StrategiesTableVariants;
  column: StrategyColumnKeys;
  order: ColumnOrder;
}>('strategiesFilters/setOrderBy');

export const resetFilters = createAction<StrategiesTableVariants>('strategiesFilters/resetFilters');
