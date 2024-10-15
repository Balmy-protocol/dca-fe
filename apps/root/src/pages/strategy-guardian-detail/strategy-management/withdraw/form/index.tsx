import { DisplayStrategy, FeeType } from 'common-types';
import React from 'react';
import WithdrawAssetInput from '../asset-input';
import EarnWithdrawTransactionManager from '../tx-manager';
import EarnWithdrawChangesSummary from '../changes-summary';
import StrategyManagementFees from '../../components/fees';
import { useEarnManagementState } from '@state/earn-management/hooks';
import FormWalletSelector from '@common/components/form-wallet-selector';
import DelayedWithdrawContainer from '../delayed-withdraw-container';

interface WithdrawFormProps {
  strategy?: DisplayStrategy;
  setHeight: (a?: number) => void;
}

const WithdrawForm = ({ strategy, setHeight }: WithdrawFormProps) => {
  const { withdrawAmount } = useEarnManagementState();
  return (
    <>
      <DelayedWithdrawContainer strategy={strategy} />
      <FormWalletSelector tokensToFilter={strategy?.asset ? [strategy.asset] : undefined} />
      <WithdrawAssetInput strategy={strategy} />
      <EarnWithdrawChangesSummary strategy={strategy} />
      <StrategyManagementFees strategy={strategy} feeType={FeeType.WITHDRAW} assetAmount={withdrawAmount} />
      <EarnWithdrawTransactionManager strategy={strategy} setHeight={setHeight} />
    </>
  );
};

export default WithdrawForm;
