import React from 'react';
import WalletContext from 'common/wallet-context';

function useCurrentNetwork() {
  const { web3Service } = React.useContext(WalletContext);
  const [network, setCurrentNetwork] = React.useState({ chainId: 0, name: '' });
  React.useEffect(() => {
    async function getNetwork() {
      const currentNetwork = await web3Service.getNetwork();
      setCurrentNetwork(currentNetwork);
    }

    getNetwork();
  }, [web3Service]);

  return network;
}

export default useCurrentNetwork;
