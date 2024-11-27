import React from 'react';
import { ContainerBox } from 'ui-library';
import PendingDelayedWithdrawals from '../pending-delayed-withdrawals';
import ReadyDelayedWithdrawals from '../ready-delayed-withdrawals';
import useEarnPositions from '@hooks/earn/useEarnPositions';
import { getDelayedWithdrawals } from '@common/utils/earn/parsing';

const DelayedWithdrawContainer = () => {
  const { userStrategies } = useEarnPositions();
  const hasDelayedWithdraws = React.useMemo(
    () => getDelayedWithdrawals({ userStrategies }).length > 0,
    [userStrategies]
  );

  if (!hasDelayedWithdraws) return null;
  return (
    <ContainerBox gap={3} alignItems="center">
      <ReadyDelayedWithdrawals />
      <PendingDelayedWithdrawals />
    </ContainerBox>
  );
};

export default DelayedWithdrawContainer;
