import React from 'react';
import { DelayedWithdrawalPositions, DelayedWithdrawalStatus, StrategyId } from 'common-types';
import useEarnPositions from './useEarnPositions';

const calculateTotalDelayedAmountsUsd = (position: DelayedWithdrawalPositions) => {
  return position.delayed.reduce(
    (acc, delayed) => {
      return {
        totalPendingUsd: acc.totalPendingUsd + Number(delayed.pending.amountInUSD || 0),
        totalReadyUsd: acc.totalReadyUsd + Number(delayed.ready.amountInUSD || 0),
      };
    },
    {
      totalPendingUsd: 0,
      totalReadyUsd: 0,
    }
  );
};

export default function useDelayedWithdrawalPositions({
  strategyGuardianId,
  chainId,
  withdrawStatus,
}: {
  strategyGuardianId?: StrategyId;
  chainId?: number;
  withdrawStatus?: DelayedWithdrawalStatus;
}) {
  const { userStrategies } = useEarnPositions();

  // MOCK DATA
  const delayedWithdrawalPositions = userStrategies.map((strategy) => ({
    ...strategy,
    delayed: [
      {
        pending: {
          amount: 100n,
          amountInUSD: 100,
        },
        ready: {
          amount: 100n,
          amountInUSD: 100,
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
        )
        .reduce<DelayedWithdrawalPositions[]>((acc, position) => {
          // Calculate totals
          const { totalPendingUsd, totalReadyUsd } = calculateTotalDelayedAmountsUsd(position);
          const positionWithTotals: DelayedWithdrawalPositions = {
            ...position,
            totalPendingUsd,
            totalReadyUsd,
          };

          // No status filter
          if (!withdrawStatus) {
            acc.push(positionWithTotals);
            return acc;
          }

          // Filter by status
          if (withdrawStatus === DelayedWithdrawalStatus.PENDING && totalPendingUsd > 0) {
            acc.push(positionWithTotals);
          } else if (withdrawStatus === DelayedWithdrawalStatus.READY && totalReadyUsd > 0) {
            acc.push(positionWithTotals);
          }

          return acc;
        }, []),
    [userStrategies, strategyGuardianId, chainId, withdrawStatus]
  );
}
