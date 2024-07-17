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
import { ColumnOrder, StrategyColumnKeys } from '@pages/earn/components/strategies-table/components/columns';

export interface AllStrategiesFiltersState {
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

export const initialState: AllStrategiesFiltersState = {
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
    order: 'desc',
  },
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(setAssetFilter, (state, { payload }) => {
      state.assets = payload;
    })
    .addCase(setFarmFilter, (state, { payload }) => {
      state.farms = payload;
    })
    .addCase(setNetworkFilter, (state, { payload }) => {
      state.networks = payload;
    })
    .addCase(setRewardFilter, (state, { payload }) => {
      state.rewards = payload;
    })
    .addCase(setGuardianFilter, (state, { payload }) => {
      state.guardians = payload;
    })
    .addCase(setYieldTypeFilter, (state, { payload }) => {
      state.yieldTypes = payload;
    })
    .addCase(setSearch, (state, { payload }) => {
      state.search = payload;
    })
    .addCase(setOrderBy, (state, { payload }) => {
      state.orderBy = payload;
    })
    .addCase(resetFilters, (state) => {
      return { ...initialState, search: state.search };
    });
});
