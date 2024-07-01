import { createAction } from '@reduxjs/toolkit';
import { ChainId, FarmId, GuardianId, StrategyYieldType, Token } from 'common-types';

export const setAssetFilter = createAction<Token[]>('allStrategiesFilters/setAssetFilter');

export const setNetworkFilter = createAction<ChainId[]>('allStrategiesFilters/setNetworkFilter');

export const setRewardFilter = createAction<Token[]>('allStrategiesFilters/setRewardFilter');

export const setFarmFilter = createAction<FarmId[]>('allStrategiesFilters/setFarmFilter');

export const setGuardianFilter = createAction<GuardianId[]>('allStrategiesFilters/setGuardianFilter');

export const setYieldTypeFilter = createAction<StrategyYieldType[]>('allStrategiesFilters/setYieldTypeFilter');

export const setSearch = createAction<string>('allStrategiesFilters/setSearch');

export const resetFilters = createAction('allStrategiesFilters/resetFilters');
