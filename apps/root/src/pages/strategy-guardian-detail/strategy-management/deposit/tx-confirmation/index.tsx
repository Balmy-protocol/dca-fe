import TransactionConfirmation from '@common/components/transaction-confirmation';
import { resetEarnForm } from '@state/earn-management/actions';
import { useAppDispatch } from '@state/hooks';
import { AmountsOfToken, DisplayStrategy, TransactionApplicationIdentifier } from 'common-types';
import React from 'react';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';

interface EarnDepositTransactionConfirmationProps {
  balance?: AmountsOfToken;
  strategy?: DisplayStrategy;
  shouldShowConfirmation: boolean;
  currentTransaction: string;
  setShouldShowConfirmation: (shouldShow: boolean) => void;
  setHeight?: (a?: number) => void;
  applicationIdentifier: TransactionApplicationIdentifier;
}

const EarnDepositTransactionConfirmation = ({
  strategy,
  shouldShowConfirmation,
  currentTransaction,
  setShouldShowConfirmation,
  setHeight,
  applicationIdentifier,
}: EarnDepositTransactionConfirmationProps) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const asset = strategy?.asset;

  const onResetForm = () => {
    setShouldShowConfirmation(false);
    dispatch(resetEarnForm());
  };

  return (
    <TransactionConfirmation
      shouldShow={shouldShowConfirmation}
      transaction={currentTransaction}
      setHeight={setHeight}
      showBalanceChanges={false}
      successSubtitle={
        <FormattedMessage
          description="earn.strategy-management.deposit.tx-confirmation.success-subtitle"
          defaultMessage="Your {asset} investment is now active!"
          values={{
            asset: asset?.symbol || '',
          }}
        />
      }
      successTitle={
        <FormattedMessage
          description="earn.strategy-management.deposit.tx-confirmation.success-title"
          defaultMessage="Desposit confirmed"
        />
      }
      loadingTitle={intl.formatMessage(
        defineMessage({
          description: 'earn.strategy-management.deposit.tx-confirmation.loading-title',
          defaultMessage: 'Depositing into vault...',
        })
      )}
      loadingSubtitle={intl.formatMessage(
        defineMessage({
          description: 'earn.strategy-management.deposit.tx-confirmation.loading-subtitle',
          defaultMessage: 'It will be confirmed soon',
        })
      )}
      actions={[
        {
          variant: 'contained',
          color: 'primary',
          onAction: onResetForm,
          label: intl.formatMessage({
            description: 'earn.strategy-management.deposit.tx-confirmation.done',
            defaultMessage: 'Done',
          }),
        },
      ]}
      txIdentifierForSatisfaction={applicationIdentifier}
    />
  );
};

export default EarnDepositTransactionConfirmation;
