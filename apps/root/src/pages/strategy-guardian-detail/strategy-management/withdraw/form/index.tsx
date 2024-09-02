import { DisplayStrategy } from 'common-types';
import React from 'react';
import WithdrawAssetInput from '../asset-input';
import EarnWithdrawTransactionManager from '../tx-manager';
import EarnWithdrawChangesSummary from '../changes-summary';

interface WithdrawFormProps {
  strategy?: DisplayStrategy;
}

const WithdrawForm = ({ strategy }: WithdrawFormProps) => {
  return (
    <>
      <WithdrawAssetInput strategy={strategy} />
      <EarnWithdrawChangesSummary strategy={strategy} />
      <EarnWithdrawTransactionManager strategy={strategy} />
    </>
  );
};

export default WithdrawForm;
