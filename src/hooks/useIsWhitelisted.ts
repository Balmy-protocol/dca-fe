import React from 'react';
import WalletContext from 'common/wallet-context';
import DcaV1Owners from 'config/nft-owners/dca-v1-owners.json';
import DefiLatamOwners from 'config/nft-owners/defi-latam.json';
import DefyBuildersOwners from 'config/nft-owners/defy-builders.json';
import LobsterOwners from 'config/nft-owners/lobster-owners.json';
import { TESTNETS } from 'config/constants';
import useCurrentNetwork from './useCurrentNetwork';

function useAvailablePairs() {
  const { web3Service } = React.useContext(WalletContext);
  const currentNetwork = useCurrentNetwork();
  return React.useMemo(() => {
    const account = web3Service.getAccount().toLowerCase();
    return (
      TESTNETS.includes(currentNetwork.chainId) ||
      DcaV1Owners.includes(account) ||
      DefiLatamOwners.includes(account) ||
      DefyBuildersOwners.includes(account) ||
      LobsterOwners.includes(account)
    );
  }, [web3Service.getAccount(), currentNetwork]);
}

export default useAvailablePairs;
