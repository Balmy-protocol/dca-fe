import React from 'react';

import BalancesUpdater from '@state/balances/balancesUpdater';
import NetworkUpdater from '@state/config/networkUpdater';
import TransactionUpdater from '@state/transactions/transactionUpdater';
import EarnPositionsUpdater from './earn-positions-updater';
import useEarnAccess from '@hooks/useEarnAccess';

const PollingHandlers = () => {
  const { hasEarnAccess } = useEarnAccess();
  return (
    <>
      <TransactionUpdater />
      <BalancesUpdater />
      <NetworkUpdater />
      {hasEarnAccess && <EarnPositionsUpdater />}
    </>
  );
};

export default PollingHandlers;
