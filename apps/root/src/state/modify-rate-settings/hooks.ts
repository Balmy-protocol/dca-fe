import { useAppSelector } from '@state/hooks';
import { RootState } from '../index';

export function useModifyRateSettingsFromValue() {
  return useAppSelector((state: RootState) => state.modifyRateSettings.fromValue);
}
export function useModifyRateSettingsRate() {
  return useAppSelector((state: RootState) => state.modifyRateSettings.rate);
}

export function useModifyRateSettingsFrequencyValue() {
  return useAppSelector((state: RootState) => state.modifyRateSettings.frequencyValue);
}
export function useModifyRateSettingsUseWrappedProtocolToken() {
  return useAppSelector((state: RootState) => state.modifyRateSettings.useWrappedProtocolToken);
}
