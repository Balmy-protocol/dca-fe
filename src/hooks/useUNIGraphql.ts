import React from 'react';
import WalletContext from 'common/wallet-context';

function useUNIGraphql() {
  const context = React.useContext(WalletContext);

  return context.graphPricesClient;
}

export default useUNIGraphql;
