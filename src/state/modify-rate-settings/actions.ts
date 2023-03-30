import { createAction } from '@reduxjs/toolkit';
import { FULL_DEPOSIT_TYPE, RATE_TYPE } from 'config/constants';

export const initializeModifyRateSettings = createAction<{
  fromValue: string;
  frequencyValue: string;
  rate: string;
  modeType: typeof FULL_DEPOSIT_TYPE | typeof RATE_TYPE;
}>('modifyRateSettings/initializeModifyRateSettings');
export const setFromValue = createAction<string>('modifyRateSettings/setFromValue');
export const setRate = createAction<string>('modifyRateSettings/setRate');
export const setModeType = createAction<typeof FULL_DEPOSIT_TYPE | typeof RATE_TYPE>('modifyRateSettings/setModeType');
export const setFrequencyValue = createAction<string>('modifyRateSettings/setFrequencyValue');
export const setUseWrappedProtocolToken = createAction<boolean>('modifyRateSettings/setUseWrappedProtocolToken');
export const resetModifySettingsModal = createAction('modifyRateSettings/resetModifySettingsModal');
