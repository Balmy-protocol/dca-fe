import WalletContext from '@common/components/wallet-context';
import React from 'react';
import { Address } from 'viem';

function useAccount(): Address {
  const context = React.useContext(WalletContext);

  return context.account;
}

export default useAccount;
