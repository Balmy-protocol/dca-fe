import { useAppSelector } from '@state/hooks';
import { RootState } from '../index';

export function usePositionDetails(id?: string) {
  return useAppSelector((state: RootState) =>
    state.positionDetails.position?.id === id
      ? { position: state.positionDetails.position, isLoading: state.positionDetails.isLoading }
      : { position: undefined, isLoading: state.positionDetails.isLoading }
  );
}

export function usePositionPrices(id?: string) {
  return useAppSelector((state: RootState) =>
    state.positionDetails.position?.id === id
      ? { fromPrice: state.positionDetails.fromPrice, toPrice: state.positionDetails.toPrice }
      : null
  );
}
