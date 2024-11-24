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
    {(process.env.EARN_ENABLED === 'true' && <EarnPositionsUpdater />) ?? null}
  </>
);

export default PollingHandlers;
