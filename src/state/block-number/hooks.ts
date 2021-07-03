import { useAppSelector } from 'state/hooks';
import { RootState } from '../index';

export function useBlockNumber(): number | undefined {
  return useAppSelector((state: RootState) => state.blockNumber.blockNumber || -1);
}
