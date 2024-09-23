import React from 'react';
import useWeb3Service from './useWeb3Service';

function useLoadedAsSafeApp() {
  const web3Service = useWeb3Service();

  const loadedAsSafeApp: boolean = React.useMemo(() => web3Service.getLoadedAsSafeApp(), []);

  return loadedAsSafeApp;
}

export default useLoadedAsSafeApp;
