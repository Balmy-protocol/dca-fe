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
} from './actions';
import { ChainId, FarmId, GuardianId, StrategyRiskLevel, StrategyYieldType, Token } from 'common-types';

export interface AllStrategiesFiltersState {
  assets: Token[];
  networks: ChainId[];
  rewards: Token[];
  farms: FarmId[];
  yieldTypes: StrategyYieldType[];
  riskLevels: StrategyRiskLevel[];
  guardians: GuardianId[];
  search: string;
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
    .addCase(resetFilters, () => {
      return { ...initialState };
    });
});
