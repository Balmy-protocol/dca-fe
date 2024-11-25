import { createAction } from '@reduxjs/toolkit';
import { SwapOptionWithFailure, Token } from '@types';

export const setFromValue = createAction<{ value: string; updateMode?: boolean }>('aggregator/setFromValue');

export const setCleared = createAction<boolean>('aggregator/setCleared');

export const setToValue = createAction<{ value: string; updateMode?: boolean }>('aggregator/setToValue');

export const setFrom = createAction<Token | null>('aggregator/setFrom');

export const setTo = createAction<Token | null>('aggregator/setTo');

export const toggleFromTo = createAction('aggregator/toggleFromTo');

export const setSelectedRoute = createAction<SwapOptionWithFailure | null>('aggregator/setSelectedRoute');

export const resetForm = createAction('aggregator/resetForm');

export const setTransferTo = createAction<string | null>('aggregator/setTransferTo');

export const setAggregatorChainId = createAction<number>('aggregator/setChainId');
