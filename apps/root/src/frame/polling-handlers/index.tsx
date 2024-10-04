import React from 'react';

import BalancesUpdater from '@state/balances/balancesUpdater';
import NetworkUpdater from '@state/config/networkUpdater';
import TransactionUpdater from '@state/transactions/transactionUpdater';
import EarnPositionsUpdater from './earn-positions-updater';

const PollingHandlers = () => (
  <>
    <TransactionUpdater />
    <BalancesUpdater />
    <NetworkUpdater />
    <EarnPositionsUpdater />
  </>
);

export default PollingHandlers;
