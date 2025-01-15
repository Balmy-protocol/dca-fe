import TierService, { TierServiceData } from '@services/tierService';
import useServiceEvents from '@hooks/useServiceEvents';
import useTierService from './useTierService';
import React from 'react';
import useWallets from '@hooks/useWallets';

const useTierLevel = () => {
  const tierService = useTierService();
  const wallets = useWallets();
  const tierLevel = useServiceEvents<TierServiceData, TierService, 'getUserTier'>(tierService, 'getUserTier');
  const achievements = useServiceEvents<TierServiceData, TierService, 'getAchievements'>(
    tierService,
    'getAchievements'
  );

  const { progress, missing, details, walletsToVerify } = tierService.getProgressPercentageToNextTier();

  return React.useMemo(
    () => ({ tierLevel, progress, missing, details, walletsToVerify }),
    [tierLevel, progress, missing, details, walletsToVerify, wallets, achievements]
  );
};

export default useTierLevel;
