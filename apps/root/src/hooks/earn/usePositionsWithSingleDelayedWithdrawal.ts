import React from 'react';
import { DelayedWithdrawalPositions, DelayedWithdrawalStatus, StrategyId } from 'common-types';
import useDelayedWithdrawalPositions from './useDelayedWithdrawalPositions';

type EarnPositionSingleDelayed = DistributiveOmit<DelayedWithdrawalPositions, 'delayed'> & {
  delayed: DelayedWithdrawalPositions['delayed'][number];
};

interface UsePositionsWithSingleDelayedWithdrawalProps {
  status?: DelayedWithdrawalStatus;
  strategyGuardianId?: StrategyId;
  chainId?: number;
}

// Each delayed withdrawal token has an independent status, so we need to have a separate item for each one
const usePositionsWithSingleDelayedWithdrawal = ({
  status,
  strategyGuardianId,
  chainId,
}: UsePositionsWithSingleDelayedWithdrawalProps = {}) => {
  const delayedWithdrawals = useDelayedWithdrawalPositions({ strategyGuardianId, chainId });

  return React.useMemo<EarnPositionSingleDelayed[]>(
    () =>
      delayedWithdrawals
        .reduce<EarnPositionSingleDelayed[]>((acc, position) => {
          const positionsSingleDelayed = position.delayed.map<EarnPositionSingleDelayed>((delayed) => ({
            ...position,
            delayed,
          }));

          acc.push(...positionsSingleDelayed);
          return acc;
        }, [])
        .filter((position) => {
          if (status === DelayedWithdrawalStatus.PENDING) {
            return position.delayed.pending.amount > 0n;
          }
          if (status === DelayedWithdrawalStatus.READY) {
            return position.delayed.ready.amount > 0n;
          }
          return true;
        }),
    [delayedWithdrawals, status]
  );
};

export default usePositionsWithSingleDelayedWithdrawal;
