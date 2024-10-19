import React from 'react';
import { DelayedWithdrawalPositions, DelayedWithdrawalStatus, StrategyId } from 'common-types';
import useEarnPositions from './useEarnPositions';
import { calculatePositionTotalDelayedAmountsUsd } from '@common/utils/earn/parsing';

export default function useDelayedWithdrawalPositions({
  strategyGuardianId,
  withdrawStatus,
}: {
  strategyGuardianId?: StrategyId;
  withdrawStatus?: DelayedWithdrawalStatus;
} = {}) {
  const { userStrategies } = useEarnPositions();

  return React.useMemo<DelayedWithdrawalPositions[]>(
    () =>
      userStrategies
        .filter((position): position is DelayedWithdrawalPositions => !!position.delayed)
        .filter((position) => !strategyGuardianId || position.strategy.id === strategyGuardianId)
        .reduce<DelayedWithdrawalPositions[]>((acc, position) => {
          // Calculate totals
          const { totalPendingUsd, totalReadyUsd } = calculatePositionTotalDelayedAmountsUsd(position);
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
    [userStrategies, strategyGuardianId, withdrawStatus]
  );
}
