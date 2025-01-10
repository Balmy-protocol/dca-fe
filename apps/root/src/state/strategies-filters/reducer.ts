import { createReducer } from '@reduxjs/toolkit';
import {
  setAssetFilter,
  setProtocolFilter,
  setGuardianFilter,
  setNetworkFilter,
  setRewardFilter,
  setYieldTypeFilter,
  resetFilters,
  setSearch,
  setOrderBy,
} from './actions';
import { ChainId, GuardianId, StrategyYieldType, Token } from 'common-types';
import { StrategyColumnKeys } from '@pages/earn/components/strategies-table/components/columns';

export type ColumnOrder = 'asc' | 'desc';

export enum StrategiesTableVariants {
  ALL_STRATEGIES = 'allStrategies',
  USER_STRATEGIES = 'userStrategies',
  MIGRATION_OPTIONS = 'migrationOptions',
}

export type StrategiesFiltersState = Record<
  StrategiesTableVariants,
  {
    assets: Token[];
    networks: ChainId[];
    rewards: Token[];
    protocols: string[];
    yieldTypes: StrategyYieldType[];
    guardians: GuardianId[];
    search: string;
    orderBy: {
      column: StrategyColumnKeys;
      order: ColumnOrder;
    };
    secondaryOrderBy?: {
      column: StrategyColumnKeys;
      order: ColumnOrder;
    };
    tertiaryOrderBy?: {
      column: StrategyColumnKeys;
      order: ColumnOrder;
    };
    quarterOrderBy?: {
      column: StrategyColumnKeys;
      order: ColumnOrder;
    };
  }
>;

const initialFiltersBase = {
  assets: [],
  networks: [],
  rewards: [],
  protocols: [],
  guardians: [],
  yieldTypes: [],
  search: '',
};

export const initialState: StrategiesFiltersState = {
  [StrategiesTableVariants.ALL_STRATEGIES]: {
    ...initialFiltersBase,
    orderBy: {
      column: StrategyColumnKeys.NEEDS_TIER,
      order: 'desc' as ColumnOrder,
    },
    secondaryOrderBy: {
      column: StrategyColumnKeys.IS_PROMOTED,
      order: 'desc' as ColumnOrder,
    },
    tertiaryOrderBy: {
      column: StrategyColumnKeys.WALLET_BALANCE,
      order: 'desc' as ColumnOrder,
    },
    quarterOrderBy: {
      column: StrategyColumnKeys.TVL,
      order: 'desc' as ColumnOrder,
    },
  },
  [StrategiesTableVariants.USER_STRATEGIES]: {
    ...initialFiltersBase,
    orderBy: {
      column: StrategyColumnKeys.TOTAL_INVESTED,
      order: 'desc' as ColumnOrder,
    },
  },
  [StrategiesTableVariants.MIGRATION_OPTIONS]: {
    ...initialFiltersBase,
    orderBy: {
      column: StrategyColumnKeys.VAULT_NAME,
      order: 'asc' as ColumnOrder,
    },
  },
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(setAssetFilter, (state, { payload }) => {
      state[payload.variant].assets = payload.value;
    })
    .addCase(setProtocolFilter, (state, { payload }) => {
      state[payload.variant].protocols = payload.value;
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
      state[payload] = { ...initialState[payload], search: state[payload].search };
    });
});
