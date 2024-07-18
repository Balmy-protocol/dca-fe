import { createReducer } from '@reduxjs/toolkit';
import {
  setAssetFilter,
  setFarmFilter,
  setGuardianFilter,
  setNetworkFilter,
  setRewardFilter,
  setYieldTypeFilter,
  resetFilters,
  setSearch,
  setOrderBy,
} from './actions';
import { ChainId, FarmId, GuardianId, StrategyRiskLevel, StrategyYieldType, Token } from 'common-types';
import { StrategyColumnKeys } from '@pages/earn/components/strategies-table/components/columns';

export type ColumnOrder = 'asc' | 'desc';

export enum StrategiesTableVariants {
  ALL_STRATEGIES = 'allStrategies',
  USER_STRATEGIES = 'userStrategies',
}

export type StrategiesFiltersState = Record<
  StrategiesTableVariants,
  {
    assets: Token[];
    networks: ChainId[];
    rewards: Token[];
    farms: FarmId[];
    yieldTypes: StrategyYieldType[];
    riskLevels: StrategyRiskLevel[];
    guardians: GuardianId[];
    search: string;
    orderBy: {
      column: StrategyColumnKeys;
      order: ColumnOrder;
    };
  }
>;

const initialFilters = {
  assets: [],
  networks: [],
  rewards: [],
  farms: [],
  guardians: [],
  yieldTypes: [],
  riskLevels: [],
  search: '',
  orderBy: {
    column: StrategyColumnKeys.TVL,
    order: 'desc' as ColumnOrder,
  },
};

export const initialState: StrategiesFiltersState = {
  [StrategiesTableVariants.ALL_STRATEGIES]: { ...initialFilters },
  [StrategiesTableVariants.USER_STRATEGIES]: { ...initialFilters },
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(setAssetFilter, (state, { payload }) => {
      state[payload.variant].assets = payload.value;
    })
    .addCase(setFarmFilter, (state, { payload }) => {
      state[payload.variant].farms = payload.value;
    })
    .addCase(setNetworkFilter, (state, { payload }) => {
      state[payload.variant].networks = payload.value;
    })
    .addCase(setRewardFilter, (state, { payload }) => {
      state[payload.variant].rewards = payload.value;
    })
    .addCase(setGuardianFilter, (state, { payload }) => {
      state[payload.variant].guardians = payload.value;
    })
    .addCase(setYieldTypeFilter, (state, { payload }) => {
      state[payload.variant].yieldTypes = payload.value;
    })
    .addCase(setSearch, (state, { payload }) => {
      state[payload.variant].search = payload.value;
    })
    .addCase(setOrderBy, (state, { payload }) => {
      state[payload.variant].orderBy = { column: payload.column, order: payload.order };
    })
    .addCase(resetFilters, (state, { payload }) => {
      state[payload] = { ...initialFilters, search: state[payload].search };
    });
});
