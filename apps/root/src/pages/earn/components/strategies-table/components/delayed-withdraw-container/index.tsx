import useDelayedWithdrawalPositions from '@hooks/earn/useDelayedWithdrawalPositions';
import React from 'react';
import { ContainerBox } from 'ui-library';
import PendingDelayedWithdrawals from '../pending-delayed-withdrawals';
import ReadyDelayedWithdrawals from '../ready-delayed-withdrawals';

const DelayedWithdrawContainer = () => {
  const delayedWithdrawalPositions = useDelayedWithdrawalPositions();

  const hasDelayedWithdraws = delayedWithdrawalPositions.length > 0;

  if (!hasDelayedWithdraws) return null;
  return (
    <ContainerBox gap={3} alignItems="center">
      <ReadyDelayedWithdrawals />
      <PendingDelayedWithdrawals />
    </ContainerBox>
  );
};

export default DelayedWithdrawContainer;
