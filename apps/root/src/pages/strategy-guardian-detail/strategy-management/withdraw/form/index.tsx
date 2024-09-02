import { DisplayStrategy } from 'common-types';
import React from 'react';
import WithdrawAssetInput from '../asset-input';
import EarnWithdrawTransactionManager from '../tx-manager';

interface WithdrawFormProps {
  strategy?: DisplayStrategy;
}

const WithdrawForm = ({ strategy }: WithdrawFormProps) => {
  return (
    <>
      <WithdrawAssetInput strategy={strategy} />
      <EarnWithdrawTransactionManager strategy={strategy} />
    </>
  );
};

export default WithdrawForm;
