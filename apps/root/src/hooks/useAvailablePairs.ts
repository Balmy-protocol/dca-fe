import usePairService from './usePairService';
import useServiceEvents from './useServiceEvents';
import PairService, { PairServiceData } from '@services/pairService';

function useAvailablePairs(chainId: number) {
  const pairService = usePairService();

  const availablePairs = useServiceEvents<PairServiceData, PairService, 'getAvailablePairs'>(
    pairService,
    'getAvailablePairs'
  );

  return availablePairs[chainId];
}

export default useAvailablePairs;
