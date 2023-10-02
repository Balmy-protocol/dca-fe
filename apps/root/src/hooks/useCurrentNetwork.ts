import { DEFAULT_NETWORK_FOR_VERSION, LATEST_VERSION } from '@constants';
import { useAppSelector } from '@state/hooks';
import React from 'react';

function useCurrentNetwork() {
  const network = useAppSelector((state) => state.config.network);

  return React.useMemo(
    () => (network && { ...network, isSet: true }) || { ...DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION], isSet: false },
    [network]
  );
}

export default useCurrentNetwork;
