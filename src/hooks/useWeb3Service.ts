import React from 'react';
import WalletContext from 'common/wallet-context';

function useWeb3Service() {
  const context = React.useContext(WalletContext);

  return context.web3Service;
}

export default useWeb3Service;
