import React from 'react';
import { REFERRED_BY_ID_KEY } from '@services/accountService';
import { useSearchParams } from 'react-router-dom';

const ReferredByHandler = () => {
  const [searchParams] = useSearchParams();
  const referredBy = searchParams.get('refId');

  React.useEffect(() => {
    const storedReferredBy = localStorage.getItem(REFERRED_BY_ID_KEY);
    // Only replace stored value if it's not already set or if the new value is different
    if (!referredBy || (storedReferredBy && storedReferredBy === referredBy)) {
      return;
    }

    localStorage.setItem(REFERRED_BY_ID_KEY, referredBy);
  }, [referredBy]);

  return null;
};

export default ReferredByHandler;
