import React from 'react';
import useInterval from '@hooks/useInterval';
import useEarnService from '@hooks/earn/useEarnService';
import { IntervalSetActions } from '@constants/timing';

const EarnPositionsUpdater = () => {
  const earnService = useEarnService();
  const updateInterval = IntervalSetActions.earnPositionsUpdate;

  const updateBalancesAndPrices = React.useCallback(async () => {
    await earnService.fetchUserStrategies();
  }, []);

  useInterval(updateBalancesAndPrices, updateInterval);

  return null;
};

export default EarnPositionsUpdater;
