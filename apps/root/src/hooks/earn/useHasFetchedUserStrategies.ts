import useEarnService from './useEarnService';
import useServiceEvents from '@hooks/useServiceEvents';
import { EarnService, EarnServiceData } from '@services/earnService';

export default function useHasFetchedUserStrategies() {
  const earnService = useEarnService();

  const hasFetchedUserStrategies = useServiceEvents<EarnServiceData, EarnService, 'getHasFetchedUserStrategies'>(
    earnService,
    'getHasFetchedUserStrategies'
  );

  return hasFetchedUserStrategies;
}
