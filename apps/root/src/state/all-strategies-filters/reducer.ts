import { createReducer } from '@reduxjs/toolkit';
import {
  setAssetFilter,
  setFarmFilter,
  setGuardianFilter,
  setNetworkFilter,
  setRewardFilter,
  setYieldTypeFilter,
} from './actions';
import { ChainId, StrategyRiskLevel, StrategyYieldType, Token } from 'common-types';

export interface AllStrategiesFiltersState {
  assets: Token[];
  networks: ChainId[];
  rewards: Token[];
  farms: string[];
  yieldTypes: StrategyYieldType[];
  riskLevels: StrategyRiskLevel[];
  guardians: string[];
}

export const initialState: AllStrategiesFiltersState = {
  assets: [],
  networks: [],
  rewards: [],
  farms: [],
  guardians: [],
  yieldTypes: [],
  riskLevels: [],
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
    });
});
