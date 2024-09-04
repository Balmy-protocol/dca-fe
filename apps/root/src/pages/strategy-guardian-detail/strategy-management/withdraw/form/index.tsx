import { DisplayStrategy, FeeType } from 'common-types';
import React from 'react';
import WithdrawAssetInput from '../asset-input';
import EarnWithdrawTransactionManager from '../tx-manager';
import EarnWithdrawChangesSummary from '../changes-summary';
import StrategyManagementFees from '../../components/fees';
import { useEarnManagementState } from '@state/earn-management/hooks';

interface WithdrawFormProps {
  strategy?: DisplayStrategy;
  setHeight: (a?: number) => void;
}

const WithdrawForm = ({ strategy, setHeight }: WithdrawFormProps) => {
  const { withdrawAmount } = useEarnManagementState();
  return (
    <>
      <WithdrawAssetInput strategy={strategy} />
      <EarnWithdrawChangesSummary strategy={strategy} />
      <StrategyManagementFees strategy={strategy} feeType={FeeType.withdraw} assetAmount={withdrawAmount} />
      <EarnWithdrawTransactionManager strategy={strategy} setHeight={setHeight} />
    </>
  );
};

export default WithdrawForm;
