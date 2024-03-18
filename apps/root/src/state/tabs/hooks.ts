import { useAppSelector } from '@state/hooks';
import { RootState } from '../index';

export function useCurrentRoute() {
  return useAppSelector((state: RootState) => state.tabs.currentRoute);
}

export function useOpenClosePositionTab() {
  return useAppSelector((state: RootState) => state.tabs.openClosedPositions);
}
