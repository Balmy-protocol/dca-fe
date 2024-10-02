import TokenIcon from '@common/components/token-icon';
import TransactionConfirmation from '@common/components/transaction-confirmation';
import { formatCurrencyAmount, parseNumberUsdPriceToBigInt, parseUsdPrice } from '@common/utils/currency';
import { calculateEarnFeeAmount } from '@common/utils/earn/parsing';
import { resetEarnForm } from '@state/earn-management/actions';
import { useEarnManagementState } from '@state/earn-management/hooks';
import { useAppDispatch } from '@state/hooks';
import {
  AmountsOfToken,
  DisplayStrategy,
  FeeType,
  TransactionApplicationIdentifier,
  TransactionEventIncomingTypes,
} from 'common-types';
import React from 'react';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { parseUnits } from 'viem';

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
  const { depositAmount: assetAmountInUnits } = useEarnManagementState();
  const asset = strategy?.asset;

  const onResetForm = () => {
    setShouldShowConfirmation(false);
    dispatch(resetEarnForm());
  };

  const customBalanceChanges = React.useMemo(() => {
    if (!asset) return;

    const depositAmount = parseUnits(assetAmountInUnits || '0', asset.decimals);
    const depositAmounts: AmountsOfToken = {
      amount: depositAmount,
      amountInUnits: formatCurrencyAmount({
        amount: depositAmount,
        token: asset,
        intl,
      }),
      amountInUSD: parseUsdPrice(asset, depositAmount, parseNumberUsdPriceToBigInt(asset.price)).toFixed(2),
    };

    return {
      inflow: TransactionEventIncomingTypes.INCOMING,
      amount: depositAmounts,
      token: { ...asset, icon: <TokenIcon size={6} token={asset} /> },
      title: defineMessage({
        description: 'earn.strategy-management.deposit.tx-confirmation.balance-changes-title',
        defaultMessage: 'Vault Balance',
      }),
    };
  }, [asset, assetAmountInUnits, intl]);

  const feeCost = React.useMemo(() => {
    const feeAmount = calculateEarnFeeAmount({
      feeType: FeeType.DEPOSIT,
      assetAmount: assetAmountInUnits,
      strategy,
    });

    if (!feeAmount || !asset) return;

    return {
      cost: {
        amount: feeAmount,
        amountInUnits: formatCurrencyAmount({
          amount: feeAmount,
          token: asset,
          intl,
        }),
        amountInUSD: parseUsdPrice(asset, feeAmount, parseNumberUsdPriceToBigInt(asset.price)).toFixed(2),
      },
      title: defineMessage({
        description: 'earn.strategy-management.deposit.tx-confirmation.fee-cost-title',
        defaultMessage: 'Guardian fee',
      }),
      token: asset,
    };
  }, [strategy, assetAmountInUnits]);

  return (
    <TransactionConfirmation
      shouldShow={shouldShowConfirmation}
      transaction={currentTransaction}
      setHeight={setHeight}
      showWalletBalanceChanges={false}
      feeCost={feeCost}
      customBalanceChanges={customBalanceChanges ? [customBalanceChanges] : undefined}
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