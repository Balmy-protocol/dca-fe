import useActiveWallet from '@hooks/useActiveWallet';
import { useTokenBalance } from '@state/balances/hooks';
import { DisplayStrategy } from 'common-types';
import React from 'react';
import EarnAssetInput from '../asset-input';
import EarnDepositTransactionManager from '../tx-manager';

interface DepositFormProps {
  strategy?: DisplayStrategy;
  setHeight: (a?: number) => void;
}

const DepositForm = ({ strategy, setHeight }: DepositFormProps) => {
  const activeWallet = useActiveWallet();
  const { balance } = useTokenBalance({
    token: strategy?.asset || null,
    walletAddress: activeWallet?.address,
    shouldAutoFetch: true,
  });

  return (
    <>
      <EarnAssetInput strategy={strategy} balance={balance} />
      <EarnDepositTransactionManager strategy={strategy} balance={balance} setHeight={setHeight} />
    </>
  );
};

export default DepositForm;
