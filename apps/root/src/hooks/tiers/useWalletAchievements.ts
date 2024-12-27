import TierService, { TierServiceData } from '@services/tierService';
import useServiceEvents from '@hooks/useServiceEvents';
import useTierService from './useTierService';

const useWalletAchievements = () => {
  const tierService = useTierService();
  const achievements = useServiceEvents<TierServiceData, TierService, 'getAchievements'>(
    tierService,
    'getAchievements'
  );

  return achievements;
};

export default useWalletAchievements;
