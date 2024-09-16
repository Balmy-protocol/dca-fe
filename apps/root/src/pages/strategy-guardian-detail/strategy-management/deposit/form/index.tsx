import useActiveWallet from '@hooks/useActiveWallet';
import { useTokenBalance } from '@state/balances/hooks';
import { DisplayStrategy, FeeType } from 'common-types';
import React from 'react';
import EarnAssetInput from '../asset-input';
import EarnDepositTransactionManager from '../tx-manager';
import FormWalletSelector from '@common/components/form-wallet-selector';
import { ContainerBox } from 'ui-library';
import StrategyManagementFees from '../../components/fees';
import { useEarnManagementState } from '@state/earn-management/hooks';

interface DepositFormProps {
  strategy?: DisplayStrategy;
  setHeight: (a?: number) => void;
}

const DepositForm = ({ strategy, setHeight }: DepositFormProps) => {
  const activeWallet = useActiveWallet();
  const { depositAmount } = useEarnManagementState();
  const { balance } = useTokenBalance({
    token: strategy?.asset || null,
    walletAddress: activeWallet?.address,
    shouldAutoFetch: true,
  });

  return (
    <>
      <ContainerBox flexDirection="column" gap={3}>
        <FormWalletSelector tokensToFilter={strategy?.asset ? [strategy.asset] : undefined} />
        <EarnAssetInput strategy={strategy} balance={balance} />
      </ContainerBox>
      <StrategyManagementFees strategy={strategy} feeType={FeeType.deposit} assetAmount={depositAmount} />
      <EarnDepositTransactionManager strategy={strategy} balance={balance} setHeight={setHeight} />
    </>
  );
};

export default DepositForm;
