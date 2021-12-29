import { useAppSelector } from 'state/hooks';
import { RootState } from '../index';

export function useCreatePositionState() {
  return useAppSelector((state: RootState) => state.createPosition);
}
