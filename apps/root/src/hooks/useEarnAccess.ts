import React from 'react';
import useAccountService from './useAccountService';
import useServiceEvents from './useServiceEvents';
import AccountService, { AccountServiceData } from '@services/accountService';

function useEarnAccess(): { isEarnEnabled: boolean; hasEarnAccess: boolean } {
  const accountService = useAccountService();

  const earlyAccessEnabled = useServiceEvents<AccountServiceData, AccountService, 'getEarlyAccessEnabled'>(
    accountService,
    'getEarlyAccessEnabled'
  );

  const isEarnEnabled = process.env.EARN_ENABLED === 'true';

  return React.useMemo(
    () => ({ isEarnEnabled, hasEarnAccess: isEarnEnabled && !!earlyAccessEnabled }),
    [isEarnEnabled, earlyAccessEnabled]
  );
}

export default useEarnAccess;
