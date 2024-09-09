import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { colors, ContainerBox, Typography } from 'ui-library';
import ExpectedReturnsChangesSummary, { EarnOperationVariant } from '../../components/expected-returns-changes-summary';
import { StrategyReturnPeriods } from '@common/utils/earn/parsing';
import { AmountsOfToken, FeeType } from 'common-types';
import useToken from '@hooks/useToken';
import { parseUnits } from 'viem';
import { formatCurrencyAmount, parseNumberUsdPriceToBigInt, parseUsdPrice } from '@common/utils/currency';
import { EarnDepositRecapDataProps } from '@common/components/transaction-steps/recap-data';

const RecapDataContainer = styled(ContainerBox).attrs({ flexDirection: 'column', alignItems: 'start', gap: 3 })``;
const RecapDataGroupContainer = styled(ContainerBox).attrs({ alignItems: 'flex-start', gap: 8 })``;
const RecapDataItemContainer = styled(ContainerBox).attrs({ flexDirection: 'column' })``;

const RecapDataTitle = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
  }) => ({ variant: 'bodyBold', color: colors[mode].typography.typo1 })
)``;
const RecapDataItemTitle = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
  }) => ({ variant: 'bodySmallRegular', color: colors[mode].typography.typo3 })
)``;
const RecapDataItemValue = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
  }) => ({ variant: 'bodyBold', color: colors[mode].typography.typo2 })
)``;

const EarnDepositRecapData = ({ strategy, assetAmount: assetAmountInUnits }: EarnDepositRecapDataProps) => {
  const intl = useIntl();
  const token = useToken({ tokenAddress: strategy?.asset.address, chainId: strategy?.network.chainId });

  if (!token) return null;

  const depositAmount = parseUnits(assetAmountInUnits || '0', token.decimals);
  const depositAmounts: AmountsOfToken = {
    amount: depositAmount,
    amountInUnits: formatCurrencyAmount({
      amount: depositAmount,
      token,
      intl,
    }),
    amountInUSD: parseUsdPrice(token, depositAmount, parseNumberUsdPriceToBigInt(token.price)).toFixed(2),
  };

  let feeAmounts: AmountsOfToken | undefined;
  const depositFee = strategy?.guardian?.fees.find((fee) => fee.type === FeeType.DEPOSIT);
  if (depositFee) {
    const feeAmount = (depositAmount * BigInt(depositFee.percentage * 100)) / 100000n;

    feeAmounts = {
      amount: feeAmount,
      amountInUnits: formatCurrencyAmount({
        amount: feeAmount,
        token,
        intl,
      }),
      amountInUSD: parseUsdPrice(token, feeAmount, parseNumberUsdPriceToBigInt(token.price)).toFixed(2),
    };
  }

  return (
    <ContainerBox gap={5} flexWrap="wrap">
      <RecapDataContainer>
        <RecapDataTitle>
          <FormattedMessage
            description="earn.strategy-management.deposit.tx-steps.recap-data.summary.title"
            defaultMessage="Summary"
          />
        </RecapDataTitle>
        <RecapDataGroupContainer>
          <RecapDataItemContainer>
            <RecapDataItemTitle>
              <FormattedMessage
                description="earn.strategy-management.deposit.tx-steps.recap-data.summary.deposit-amount.title"
                defaultMessage="Deposit"
              />
            </RecapDataItemTitle>
            <RecapDataItemValue>
              {depositAmounts.amountInUnits} {token.symbol}{' '}
              {depositAmounts.amountInUSD ? `($${depositAmounts.amountInUSD})` : ''}
            </RecapDataItemValue>
          </RecapDataItemContainer>
          {feeAmounts && (
            <RecapDataItemContainer>
              <RecapDataItemTitle>
                <FormattedMessage
                  description="earn.strategy-management.deposit.tx-steps.recap-data.summary.deposit-fee.title"
                  defaultMessage="Deposit Fee"
                />
              </RecapDataItemTitle>
              <RecapDataItemValue>
                {feeAmounts.amountInUnits} {feeAmounts.amountInUSD ? `($${feeAmounts.amountInUSD})` : ''}
              </RecapDataItemValue>
            </RecapDataItemContainer>
          )}
        </RecapDataGroupContainer>
      </RecapDataContainer>
      <RecapDataContainer>
        <RecapDataTitle>
          <FormattedMessage
            description="earn.strategy-management.deposit.tx-steps.recap-data.expected-earning.title"
            defaultMessage="Expected Earnings"
          />
        </RecapDataTitle>
        <ExpectedReturnsChangesSummary
          hidePeriods={[StrategyReturnPeriods.DAY]}
          strategy={strategy}
          size="small"
          assetAmount={assetAmountInUnits}
          operation={EarnOperationVariant.DEPOSIT}
        />
      </RecapDataContainer>
    </ContainerBox>
  );
};
export default EarnDepositRecapData;
