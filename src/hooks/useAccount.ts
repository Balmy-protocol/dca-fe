import WalletContext from '@common/components/wallet-context';
import React from 'react';

function useAccount(): string {
  const context = React.useContext(WalletContext);

  return context.account;
}

export default useAccount;
