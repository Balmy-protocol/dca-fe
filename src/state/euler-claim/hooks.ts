import { useAppSelector } from 'state/hooks';
import { RootState } from '../index';

export function useEulerClaimSignature() {
  return useAppSelector((state: RootState) => state.eulerClaim.signature);
}
