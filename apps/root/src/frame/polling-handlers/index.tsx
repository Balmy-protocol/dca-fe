import React from 'react';

import BalancesUpdater from '@state/balances/balancesUpdater';
import NetworkUpdater from '@state/config/networkUpdater';
import TransactionUpdater from '@state/transactions/transactionUpdater';
import EarnPositionsUpdater from './earn-positions-updater';
import TierUpdater from './tier-updater';

const PollingHandlers = () => {
  return (
    <>
      <TransactionUpdater />
      <BalancesUpdater />
      <NetworkUpdater />
      <EarnPositionsUpdater />
      <TierUpdater />
    </>
  );
};

export default PollingHandlers;
