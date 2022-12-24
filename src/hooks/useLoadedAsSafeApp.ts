import React from 'react';
import useAccount from './useAccount';
import useWeb3Service from './useWeb3Service';

function useLoadedAsSafeApp() {
  const account = useAccount();
  const web3Service = useWeb3Service();

  const loadedAsSafeApp: boolean = React.useMemo(() => web3Service.getLoadedAsSafeApp(), [account]);

  return loadedAsSafeApp;
}

export default useLoadedAsSafeApp;
