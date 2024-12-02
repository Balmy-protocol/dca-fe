import React from 'react';
import { ContainerBox } from 'ui-library';
import PendingDelayedWithdrawals from '../pending-delayed-withdrawals';
import ReadyDelayedWithdrawals from '../ready-delayed-withdrawals';

const DelayedWithdrawContainer = () => (
  <ContainerBox gap={3} alignItems="center">
    <ReadyDelayedWithdrawals />
    <PendingDelayedWithdrawals />
  </ContainerBox>
);
export default DelayedWithdrawContainer;
