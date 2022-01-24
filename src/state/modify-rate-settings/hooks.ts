import { useAppSelector } from 'state/hooks';
import { RootState } from '../index';

export function useModifyRateSettingsFromValue() {
  return useAppSelector((state: RootState) => state.modifyRateSettings.fromValue);
}
export function useModifyRateSettingsFrequencyValue() {
  return useAppSelector((state: RootState) => state.modifyRateSettings.frequencyValue);
}
export function useModifyRateSettingsUseWrappedProtocolToken() {
  return useAppSelector((state: RootState) => state.modifyRateSettings.useWrappedProtocolToken);
}
export function useModifyRateSettingsActiveStep() {
  return useAppSelector((state: RootState) => state.modifyRateSettings.activeStep);
}
