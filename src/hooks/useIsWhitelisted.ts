import React from 'react';
import WalletContext from 'common/wallet-context';
import DcaV1Owners from 'config/nft-owners/dca-v1-owners.json';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import DefiLatamOwners from 'config/nft-owners/defi-latam.json';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import DefyBuildersOwners from 'config/nft-owners/defy-builders.json';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import LobsterOwners from 'config/nft-owners/lobster-owners.json';
import { TESTNETS } from 'config/constants';
import useCurrentNetwork from './useCurrentNetwork';

function useAvailablePairs() {
  const { web3Service } = React.useContext(WalletContext);
  const currentNetwork = useCurrentNetwork();
  return React.useMemo(() => {
    if (!web3Service.getAccount()) {
      return false;
    }
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
