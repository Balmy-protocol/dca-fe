import React from 'react';
import WalletContext from 'common/wallet-context';
import { NETWORKS, SUPPORTED_NETWORKS } from 'config/constants';

function useCurrentNetwork(showOriginal = false) {
  const { web3Service } = React.useContext(WalletContext);
  const [network, setCurrentNetwork] = React.useState({ chainId: 10, name: '' });
  React.useEffect(() => {
    async function getNetwork() {
      const currentNetwork = await web3Service.getNetwork();
      if (SUPPORTED_NETWORKS.includes(currentNetwork.chainId) || showOriginal) {
        setCurrentNetwork(currentNetwork);
      } else {
        setCurrentNetwork(NETWORKS.optimism);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getNetwork();
  }, [web3Service]);

  return network;
}

export default useCurrentNetwork;
