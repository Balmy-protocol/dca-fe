import { useAppSelector } from '@state/hooks';
import { RootState } from '../index';

export function useHasInitialized(): boolean {
  return useAppSelector((state: RootState) => state.initializer.hasInitialized);
}
