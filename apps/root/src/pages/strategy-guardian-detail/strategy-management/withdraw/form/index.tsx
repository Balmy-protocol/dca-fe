import { DisplayStrategy, FeeType } from 'common-types';
import React from 'react';
import WithdrawAssetInput from '../asset-input';
import EarnWithdrawTransactionManager from '../tx-manager';
import EarnWithdrawChangesSummary from '../changes-summary';
import StrategyManagementFees from '../../components/fees';
import { useEarnManagementState } from '@state/earn-management/hooks';
import FormWalletSelector from '@common/components/form-wallet-selector';
import DelayedWithdrawContainer from '../delayed-withdraw-container';
import { useIntl, defineMessage } from 'react-intl';

interface WithdrawFormProps {
  strategy?: DisplayStrategy;
  setHeight: (a?: number) => void;
}

const WithdrawForm = ({ strategy, setHeight }: WithdrawFormProps) => {
  const { withdrawAmount } = useEarnManagementState();
  const intl = useIntl();
  return (
    <>
      <DelayedWithdrawContainer strategy={strategy} />
      <FormWalletSelector
        filter={strategy ? { chainId: strategy.network.chainId, tokens: [strategy.asset] } : undefined}
        chipDescription={intl.formatMessage(
          defineMessage({
            id: 'earn.strategy-management.withdraw.form-wallet-selector.chip-description',
            defaultMessage: 'Available:',
          })
        )}
      />
      <WithdrawAssetInput strategy={strategy} />
      <EarnWithdrawChangesSummary strategy={strategy} />
      <StrategyManagementFees strategy={strategy} feeType={FeeType.WITHDRAW} assetAmount={withdrawAmount} />
      <EarnWithdrawTransactionManager strategy={strategy} setHeight={setHeight} />
    </>
  );
};

export default WithdrawForm;
