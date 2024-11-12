import TransactionConfirmation from '@common/components/transaction-confirmation';
import { resetEarnForm } from '@state/earn-management/actions';
import { useAppDispatch } from '@state/hooks';
import { DisplayStrategy, TransactionApplicationIdentifier } from 'common-types';
import React from 'react';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { Hash } from 'viem';

interface EarnWithdrawTransactionConfirmationProps {
  strategy?: DisplayStrategy;
  shouldShowConfirmation: boolean;
  currentTransaction?: { hash: Hash; chainId: number };
  setShouldShowConfirmation: (shouldShow: boolean) => void;
  setHeight?: (a?: number) => void;
  applicationIdentifier: TransactionApplicationIdentifier;
}

const EarnWithdrawTransactionConfirmation = ({
  strategy,
  shouldShowConfirmation,
  currentTransaction,
  setShouldShowConfirmation,
  setHeight,
  applicationIdentifier,
}: EarnWithdrawTransactionConfirmationProps) => {
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
      showWalletBalanceChanges={false}
      successSubtitle={
        <FormattedMessage
          description="earn.strategy-management.withdraw.tx-confirmation.success-subtitle"
          defaultMessage="Your {asset} gains are now yours to enjoy! Time to reap the rewards of your smart investing - all earned while you focused on what truly matters."
          values={{
            asset: asset?.symbol || '',
          }}
        />
      }
      successTitle={
        <FormattedMessage
          description="earn.strategy-management.withdraw.tx-confirmation.success-title"
          defaultMessage="Withwardal Confirmed 💰"
        />
      }
      loadingTitle={intl.formatMessage(
        defineMessage({
          description: 'earn.strategy-management.withdraw.tx-confirmation.loading-title',
          defaultMessage: 'Withdrawing from Vault 🧘🏽',
        })
      )}
      loadingSubtitle={intl.formatMessage(
        defineMessage({
          description: 'earn.strategy-management.withdraw.tx-confirmation.loading-subtitle',
          defaultMessage: 'It will be confirmed soon.',
        })
      )}
      actions={[
        {
          variant: 'contained',
          color: 'primary',
          onAction: onResetForm,
          label: intl.formatMessage({
            description: 'earn.strategy-management.withdraw.tx-confirmation.done',
            defaultMessage: 'Done',
          }),
        },
      ]}
      txIdentifierForSatisfaction={applicationIdentifier}
    />
  );
};

export default EarnWithdrawTransactionConfirmation;
