import React from 'react';

import BalancesUpdater from '@state/balances/balancesUpdater';
import NetworkUpdater from '@state/config/networkUpdater';
import TransactionUpdater from '@state/transactions/transactionUpdater';
import EarnPositionsUpdater from './earn-positions-updater';
import useEarnAccess from '@hooks/useEarnAccess';
import TierUpdater from './tier-updater';

const PollingHandlers = () => {
  const { hasEarnAccess } = useEarnAccess();
  return (
    <>
      <TransactionUpdater />
      <BalancesUpdater />
      <NetworkUpdater />
      {hasEarnAccess && <EarnPositionsUpdater />}
      {hasEarnAccess && <TierUpdater />}
    </>
  );
};

export default PollingHandlers;
