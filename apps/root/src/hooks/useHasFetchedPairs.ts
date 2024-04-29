import PairService, { PairServiceData } from '@services/pairService';
import usePairService from './usePairService';
import useServiceEvents from './useServiceEvents';

function useHasFetchedPairs() {
  const pairService = usePairService();

  const hasFetchedPairs = useServiceEvents<PairServiceData, PairService, 'getHasFetchedAvailablePairs'>(
    pairService,
    'getHasFetchedAvailablePairs'
  );

  return hasFetchedPairs;
}

export default useHasFetchedPairs;
