import { useAppSelector } from 'state/hooks';
import { RootState } from '../index';

export function usePositionDetails(id?: string) {
  return useAppSelector((state: RootState) =>
    state.positionDetails.position?.id === id ? state.positionDetails.position : null
  );
}

export function useShowBreakdown() {
  return useAppSelector((state: RootState) => state.positionDetails.showBreakdown);
}
