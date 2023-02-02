import { createAction } from '@reduxjs/toolkit';
import { SwapSortOptions } from 'config/constants/aggregator';
import { SwapOption, Token } from 'types';

export const setFromValue = createAction<{ value: string; updateMode?: boolean }>('aggregator/setFromValue');

export const setToValue = createAction<{ value: string; updateMode?: boolean }>('aggregator/setToValue');

export const setFrom = createAction<Token | null>('aggregator/setFrom');

export const setTo = createAction<Token | null>('aggregator/setTo');

export const toggleFromTo = createAction('aggregator/toggleFromTo');

export const setSelectedRoute = createAction<SwapOption | null>('aggregator/setSelectedRoute');

export const setSorting = createAction<SwapSortOptions>('aggregator/setSorting');

export const resetForm = createAction('aggregator/resetForm');

export const setTransferTo = createAction<string | null>('aggregator/setTransferTo');

export const setAggregatorChainId = createAction<number>('aggregator/setChainId');
