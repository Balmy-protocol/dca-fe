import React from 'react';
import WalletContext from 'common/wallet-context';

function useChainlinkGraphql() {
  const context = React.useContext(WalletContext);

  return context.graphChainlinkClient;
}

export default useChainlinkGraphql;
