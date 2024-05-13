import { YieldOptions } from '@types';
import PairService, { PairServiceData } from '@services/pairService';
import usePairService from './usePairService';
import useServiceEvents from './useServiceEvents';

function useYieldOptions(chainId?: number): [YieldOptions | undefined, boolean] {
  const pairService = usePairService();

  const yieldOptions = useServiceEvents<PairServiceData, PairService, 'getYieldOptions'>(
    pairService,
    'getYieldOptions'
  );

  const hasFetchedAvailablePairs = useServiceEvents<PairServiceData, PairService, 'getHasFetchedAvailablePairs'>(
    pairService,
    'getHasFetchedAvailablePairs'
  );

  return [(chainId ? yieldOptions[chainId] : []) || [], !hasFetchedAvailablePairs];
}

export default useYieldOptions;
