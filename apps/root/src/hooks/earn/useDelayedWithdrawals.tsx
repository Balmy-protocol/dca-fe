import React from 'react';
import { StrategyId } from 'common-types';
import useEarnPositions from './useEarnPositions';

export default function useDelayedWithdrawals({
  strategyGuardianId,
  chainId,
}: {
  strategyGuardianId?: StrategyId;
  chainId?: number;
}) {
  const { userStrategies } = useEarnPositions();

  return React.useMemo(
    () =>
      userStrategies
        .filter((position) => !!position.delayed)
        .filter(
          (position) =>
            !strategyGuardianId ||
            !chainId ||
            (position.strategy.id === strategyGuardianId && position.strategy.network.chainId === chainId)
        ),
    [userStrategies, strategyGuardianId, chainId]
  );
}
