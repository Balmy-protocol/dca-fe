import TierService, { TierServiceData } from '@services/tierService';
import useServiceEvents from '@hooks/useServiceEvents';
import useTierService from './useTierService';

const useTierLevel = () => {
  const tierService = useTierService();
  const tierLevel = useServiceEvents<TierServiceData, TierService, 'getUserTier'>(tierService, 'getUserTier');

  const { progress, missing, details } = tierService.getProgressPercentageToNextTier();

  return { tierLevel, progress, missing, details };
};

export default useTierLevel;
