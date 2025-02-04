import React from 'react';
import useInterval from '@hooks/useInterval';
import useEarnService from '@hooks/earn/useEarnService';
import { IntervalSetActions } from '@constants/timing';

const EarnPositionsUpdater = () => {
  const earnService = useEarnService();
  const updateInterval = IntervalSetActions.earnPositionsUpdate;

  const updateUserStrategies = React.useCallback(async () => {
    await earnService.fetchUserStrategies({ includeHistory: false });
  }, []);

  useInterval(updateUserStrategies, updateInterval);

  return null;
};

export default EarnPositionsUpdater;
