import React from 'react';
import { DelayedWithdrawalPositions, StrategyId } from 'common-types';
import useEarnPositions from './useEarnPositions';

export default function useDelayedWithdrawalPositions({
  strategyGuardianId,
  chainId,
}: {
  strategyGuardianId?: StrategyId;
  chainId?: number;
}) {
  const { userStrategies } = useEarnPositions();

  // MOCK DATA
  const delayedWithdrawalPositions = userStrategies.map((strategy) => ({
    ...strategy,
    delayed: [
      {
        pending: {
          amount: 100n,
          amountInUSD: 100n,
        },
        ready: {
          amount: 100n,
          amountInUSD: 100n,
        },
      },
    ],
  })) as unknown as typeof userStrategies;

  return React.useMemo<DelayedWithdrawalPositions[]>(
    () =>
      delayedWithdrawalPositions
        .filter((position): position is DelayedWithdrawalPositions => !!position.delayed)
        .filter(
          (position) =>
            !strategyGuardianId ||
            !chainId ||
            (position.strategy.id === strategyGuardianId && position.strategy.network.chainId === chainId)
        ),
    [userStrategies, strategyGuardianId, chainId]
  );
}
