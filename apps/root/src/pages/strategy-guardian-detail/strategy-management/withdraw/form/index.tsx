import { DisplayStrategy } from 'common-types';
import React from 'react';
import WithdrawAssetInput from '../asset-input';

interface WithdrawFormProps {
  strategy?: DisplayStrategy;
}

const WithdrawForm = ({ strategy }: WithdrawFormProps) => {
  return <WithdrawAssetInput strategy={strategy} />;
};

export default WithdrawForm;
