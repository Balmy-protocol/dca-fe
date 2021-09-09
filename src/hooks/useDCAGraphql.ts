import React from 'react';
import WalletContext from 'common/wallet-context';

function useDCAGraphql() {
  const context = React.useContext(WalletContext);

  return context.DCASubgraph;
}

export default useDCAGraphql;
