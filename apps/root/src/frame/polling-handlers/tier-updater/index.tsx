import React from 'react';
import useInterval from '@hooks/useInterval';
import { IntervalSetActions } from '@constants/timing';
import useTierService from '@hooks/tiers/useTierService';

const TierUpdater = () => {
  const tierService = useTierService();
  const updateInterval = IntervalSetActions.earnPositionsUpdate;

  const updateUserTier = React.useCallback(async () => {
    await tierService.pollUser();
  }, []);

  useInterval(updateUserTier, updateInterval);

  return null;
};

export default TierUpdater;
