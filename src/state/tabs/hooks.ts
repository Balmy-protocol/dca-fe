import { useAppSelector } from 'state/hooks';
import { RootState } from '../index';

export function useMainTab() {
  return useAppSelector((state: RootState) => state.tabs.mainSelector);
}

export function useOpenClosePositionTab() {
  return useAppSelector((state: RootState) => state.tabs.openClosedPositions);
}
