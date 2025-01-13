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
import useTierLevel from '@hooks/tiers/useTierLevel';
import LockedDeposit from '../../components/locked-deposit';
import { isNil } from 'lodash';

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

  const { tierLevel } = useTierLevel();

  const isLocked = strategy?.needsTier && strategy?.needsTier > (tierLevel ?? 0);

  if (isLocked && !isNil(strategy?.needsTier)) {
    return <LockedDeposit strategy={strategy} needsTier={strategy?.needsTier} />;
  }

  return (
    <>
      <ContainerBox flexDirection="column" gap={3}>
        <FormWalletSelector
          filter={strategy ? { chainId: strategy.network.chainId, tokens: [strategy.asset] } : undefined}
        />
        <EarnAssetInput strategy={strategy} balance={balance} />
      </ContainerBox>
      <StrategyManagementFees strategy={strategy} feeType={FeeType.DEPOSIT} assetAmount={depositAmount} />
      <EarnDepositTransactionManager strategy={strategy} balance={balance} setHeight={setHeight} />
    </>
  );
};

export default DepositForm;
