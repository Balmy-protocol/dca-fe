import { createAction } from '@reduxjs/toolkit';
import { ModeTypesIds } from '@constants';

export const initializeModifyRateSettings = createAction<{
  fromValue: string;
  frequencyValue: string;
  rate: string;
  modeType: ModeTypesIds;
}>('modifyRateSettings/initializeModifyRateSettings');
export const setFromValue = createAction<string>('modifyRateSettings/setFromValue');
export const setRate = createAction<string>('modifyRateSettings/setRate');
export const setModeType = createAction<ModeTypesIds>('modifyRateSettings/setModeType');
export const setFrequencyValue = createAction<string>('modifyRateSettings/setFrequencyValue');
export const setUseWrappedProtocolToken = createAction<boolean>('modifyRateSettings/setUseWrappedProtocolToken');
export const resetModifySettingsModal = createAction('modifyRateSettings/resetModifySettingsModal');
