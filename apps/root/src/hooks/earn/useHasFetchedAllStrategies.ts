import useEarnService from './useEarnService';
import useServiceEvents from '@hooks/useServiceEvents';
import { EarnService, EarnServiceData } from '@services/earnService';

export default function useHasFetchedAllStrategies() {
  const earnService = useEarnService();

  const hasFetchedAllStrategies = useServiceEvents<EarnServiceData, EarnService, 'getHasFetchedAllStrategies'>(
    earnService,
    'getHasFetchedAllStrategies'
  );

  return hasFetchedAllStrategies;
}
