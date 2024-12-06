import React from 'react';
import useAccountService from './useAccountService';
import useServiceEvents from './useServiceEvents';
import AccountService, { AccountServiceData } from '@services/accountService';

function useEarnAccess(): { isEarnEnabled: boolean; hasEarnAccess: boolean } {
  const accountService = useAccountService();

  const earnEarlyAccess = useServiceEvents<AccountServiceData, AccountService, 'getEarnEarlyAccess'>(
    accountService,
    'getEarnEarlyAccess'
  );

  const isEarnEnabled = process.env.EARN_ENABLED === 'true';

  return React.useMemo(
    () => ({ isEarnEnabled, hasEarnAccess: isEarnEnabled && !!earnEarlyAccess?.earlyAccess }),
    [isEarnEnabled, earnEarlyAccess?.earlyAccess]
  );
}

export default useEarnAccess;
