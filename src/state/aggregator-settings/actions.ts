import { createAction } from '@reduxjs/toolkit';
import { GasKeys, SwapSortOptions } from '@constants/aggregator';

export const setSlippage = createAction<string>('aggregatorSettings/setSlippage');

export const setGasSpeed = createAction<GasKeys>('aggregatorSettings/setGasSpeed');

export const setDisabledDexes = createAction<string[]>('aggregatorSettings/setDisabledDexes');

export const setShowTransactionCost = createAction<boolean>('aggregatorSettings/setShowTransactionCost');

export const setConfetti = createAction<number>('aggregatorSettings/setConfetti');

export const setPermit2 = createAction<boolean>('aggregatorSettings/setPermit2');

export const restoreDefaults = createAction('aggregatorSettings/restoreDefaults');

export const setSorting = createAction<SwapSortOptions>('aggregator/setSorting');
