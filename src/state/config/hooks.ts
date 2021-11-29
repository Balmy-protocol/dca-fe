import { useAppSelector } from 'state/hooks';
import { RootState } from '../index';

export function useThemeMode() {
  return useAppSelector((state: RootState) => state.config.theme);
}
