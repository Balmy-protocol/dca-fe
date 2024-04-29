import { createAction } from '@reduxjs/toolkit';

export const initializeModifyRateSettings = createAction<{
  fromValue: string;
  frequencyValue: string;
  rate: string;
}>('modifyRateSettings/initializeModifyRateSettings');
export const setFromValue = createAction<string>('modifyRateSettings/setFromValue');
export const setRate = createAction<string>('modifyRateSettings/setRate');
export const setFrequencyValue = createAction<string>('modifyRateSettings/setFrequencyValue');
export const setUseWrappedProtocolToken = createAction<boolean>('modifyRateSettings/setUseWrappedProtocolToken');
export const resetModifySettingsModal = createAction('modifyRateSettings/resetModifySettingsModal');
