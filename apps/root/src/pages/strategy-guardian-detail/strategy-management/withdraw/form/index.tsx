import { DisplayStrategy } from 'common-types';
import React from 'react';
import EarnWithdrawTransactionManager from '../tx-manager';
import FormWalletSelector from '@common/components/form-wallet-selector';
import DelayedWithdrawContainer from '../delayed-withdraw-container';
import { useIntl, defineMessage } from 'react-intl';
import { AllWalletsBalances } from '@state/balances/hooks';
import { isSameToken } from '@common/utils/currency';

interface WithdrawFormProps {
  strategy?: DisplayStrategy;
  setHeight: (a?: number) => void;
}

const WithdrawForm = ({ strategy, setHeight }: WithdrawFormProps) => {
  const intl = useIntl();

  const usdBalances = React.useMemo(() => {
    return strategy?.userPositions?.reduce<AllWalletsBalances>((acc, curr) => {
      const assetBalance = curr.balances.find((balance) => isSameToken(balance.token, curr.strategy.asset));
      if (!assetBalance) return acc;

      if (!acc[curr.owner]) {
        // eslint-disable-next-line no-param-reassign
        acc[curr.owner] = 0;
      }
      // eslint-disable-next-line no-param-reassign
      acc[curr.owner] += Number(assetBalance.amount.amountInUSD);
      return acc;
    }, {});
  }, [strategy?.userPositions]);

  return (
    <>
      <DelayedWithdrawContainer strategy={strategy} />
      <FormWalletSelector
        chipDescription={intl.formatMessage(
          defineMessage({
            id: 'earn.strategy-management.withdraw.form-wallet-selector.chip-description',
            defaultMessage: 'Available:',
          })
        )}
        overrideUsdBalances={usdBalances}
      />
      <EarnWithdrawTransactionManager strategy={strategy} setHeight={setHeight} />
    </>
  );
};

export default WithdrawForm;
