import { useAppSelector } from 'state/hooks';
import { RootState } from '../index';

export function usePositionDetails() {
  return useAppSelector((state: RootState) => state.positionDetails.position);
}

export function useShowBreakdown() {
  return useAppSelector((state: RootState) => state.positionDetails.showBreakdown);
}
