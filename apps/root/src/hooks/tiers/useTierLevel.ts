import TierService, { TierServiceData } from '@services/tierService';
import useServiceEvents from '@hooks/useServiceEvents';
import useTierService from './useTierService';
import React from 'react';

const useTierLevel = () => {
  const tierService = useTierService();
  const tierLevel = useServiceEvents<TierServiceData, TierService, 'getUserTier'>(tierService, 'getUserTier');

  const { progress, missing, details, walletsToVerify } = tierService.getProgressPercentageToNextTier();

  return React.useMemo(
    () => ({ tierLevel, progress, missing, details, walletsToVerify }),
    [tierLevel, progress, missing, details, walletsToVerify]
  );
};

export default useTierLevel;
