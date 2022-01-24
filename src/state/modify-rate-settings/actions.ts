import { createAction } from '@reduxjs/toolkit';

export const initializeModifyRateSettings = createAction<{ fromValue: string; frequencyValue: string }>(
  'modifyRateSettings/initializeModifyRateSettings'
);
export const setFromValue = createAction<string>('modifyRateSettings/setFromValue');
export const setFrequencyValue = createAction<string>('modifyRateSettings/setFrequencyValue');
export const setUseWrappedProtocolToken = createAction<boolean>('modifyRateSettings/setUseWrappedProtocolToken');
export const setActiveStep = createAction<number>('modifyRateSettings/setActiveStep');
