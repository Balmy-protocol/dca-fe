import TransactionConfirmation from '@common/components/transaction-confirmation';
import useTransactionReceipt from '@hooks/useTransactionReceipt';
import { resetEarnForm } from '@state/earn-management/actions';
import { useAppDispatch } from '@state/hooks';
import { DisplayStrategy, TransactionApplicationIdentifier, TransactionEventTypes, WithdrawType } from 'common-types';
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
  const receipt = useTransactionReceipt({ transaction: currentTransaction, mergeTransactionsWithSameHash: true });

  const isDelayedWithdrawal = React.useMemo(
    () =>
      receipt &&
      receipt.type === TransactionEventTypes.EARN_WITHDRAW &&
      receipt.data.withdrawn.some(
        (withdraw) => withdraw.amount.amount > 0n && withdraw.withdrawType === WithdrawType.DELAYED
      ),
    [receipt]
  );

  const isWithdrawingRewards = React.useMemo(
    () =>
      receipt &&
      receipt.type === TransactionEventTypes.EARN_WITHDRAW &&
      receipt.data.withdrawn.some(
        (withdraw) => withdraw.amount.amount > 0n && withdraw.token.address !== asset?.address
      ),
    [receipt, asset]
  );

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
        isDelayedWithdrawal ? (
          <FormattedMessage
            description="earn.strategy-management.delayed-withdraw.tx-confirmation.success-subtitle"
            defaultMessage="Your {asset} withdrawal has been initiated! The funds will be available soon - sit back and relax while we process your request safely and securely. {rewards}"
            values={{
              asset: asset?.symbol || '',
              rewards: isWithdrawingRewards
                ? intl.formatMessage(
                    defineMessage({
                      description: 'earn.strategy-management.delayed-withdraw.tx-confirmation.success-subtitle.rewards',
                      defaultMessage: 'Your rewards will be withdrawn immediately',
                    })
                  )
                : '',
            }}
          />
        ) : (
          <FormattedMessage
            description="earn.strategy-management.withdraw.tx-confirmation.success-subtitle"
            defaultMessage="Your {asset} gains are now yours to enjoy! Time to reap the rewards of your smart investing - all earned while you focused on what truly matters."
            values={{
              asset: asset?.symbol || '',
            }}
          />
        )
      }
      successTitle={
        <FormattedMessage
          description="earn.strategy-management.withdraw.tx-confirmation.success-title"
          defaultMessage="Withdrawal Confirmed 💰"
        />
      }
      loadingTitle={intl.formatMessage(
        isDelayedWithdrawal
          ? defineMessage({
              description: 'earn.strategy-management.delayed-withdraw.tx-confirmation.loading-title',
              defaultMessage: 'Initiating withdrawal 🧘🏽',
            })
          : defineMessage({
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
