import useActiveWallet from '@hooks/useActiveWallet';
import { useTokenBalance } from '@state/balances/hooks';
import { DisplayStrategy } from 'common-types';
import React from 'react';
import { ContainerBox } from 'ui-library';
import EarnAssetInput from '../asset-input';
import EarnDepositTransactionManager from '../tx-manager';
import FormWalletSelector, { FormWalletSelectorApplication } from '@common/components/form-wallet-selector';

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
    <ContainerBox gap={3} flexDirection="column">
      <FormWalletSelector
        tokensToFilter={strategy?.asset ? [strategy.asset] : undefined}
        application={FormWalletSelectorApplication.EARN}
      />
      <EarnAssetInput strategy={strategy} balance={balance} />
      <EarnDepositTransactionManager strategy={strategy} balance={balance} setHeight={setHeight} />
    </ContainerBox>
  );
};

export default DepositForm;
