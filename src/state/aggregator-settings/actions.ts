import { createAction } from '@reduxjs/toolkit';
import { GasKeys } from 'config/constants/aggregator';

export const setSlippage = createAction<string>('aggregatorSettings/setSlippage');

export const setGasSpeed = createAction<GasKeys>('aggregatorSettings/setGasSpeed');

export const restoreDefaults = createAction('aggregatorSettings/restoreDefaults');
