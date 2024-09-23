import { useAppSelector } from '@state/hooks';
import { RootState } from '../index';

export function useThemeMode() {
  return useAppSelector((state: RootState) => state.config.theme);
}

export function useSelectedLocale() {
  return useAppSelector((state: RootState) => state.config.selectedLocale);
}

export function useShowSmallBalances() {
  return useAppSelector((state: RootState) => state.config.showSmallBalances);
}

export function useShowBalances() {
  return useAppSelector((state: RootState) => state.config.showBalances);
}

export function useSwitchActiveWalletOnConnection() {
  return useAppSelector((state: RootState) => state.config.switchActiveWalletOnConnection);
}
