import { createAction } from '@reduxjs/toolkit';
import { Token } from 'types';

export const setFromValue = createAction<{ value: string; updateMode?: boolean }>('aggregator/setFromValue');

export const setToValue = createAction<{ value: string; updateMode?: boolean }>('aggregator/setToValue');

export const setFrom = createAction<Token | null>('aggregator/setFrom');

export const setTo = createAction<Token | null>('aggregator/setTo');
