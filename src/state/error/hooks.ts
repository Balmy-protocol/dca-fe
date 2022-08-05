import { useAppSelector } from 'state/hooks';
import { RootState } from '../index';

export function useHasError() {
  return useAppSelector((state: RootState) => state.error.hasError);
}
