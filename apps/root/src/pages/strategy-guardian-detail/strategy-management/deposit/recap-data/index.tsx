import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { colors, ContainerBox, InfoCircleIcon, Tooltip, Typography } from 'ui-library';
import ExpectedReturnsChangesSummary, { EarnOperationVariant } from '../../components/expected-returns-changes-summary';
import { calculateEarnFeeBigIntAmount, StrategyReturnPeriods } from '@common/utils/earn/parsing';
import { AmountsOfToken } from 'common-types';
import { parseUnits } from 'viem';
import { formatCurrencyAmount, parseNumberUsdPriceToBigInt, parseUsdPrice } from '@common/utils/currency';
import { EarnDepositRecapDataProps } from '@common/components/transaction-steps/recap-data';
import { FeeType } from '@balmy/sdk/dist/services/earn/types';
import { useEarnManagementState } from '@state/earn-management/hooks';
import { isNil } from 'lodash';
import useToken from '@hooks/useToken';

const RecapDataContainer = styled(ContainerBox).attrs({ flexDirection: 'column', alignItems: 'start', gap: 3 })``;
const RecapDataGroupContainer = styled(ContainerBox).attrs({ alignItems: 'flex-start', gap: 8 })``;
const RecapDataItemContainer = styled(ContainerBox).attrs({ flexDirection: 'column' })``;

const RecapDataTitle = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
  }) => ({ variant: 'h6Bold', color: colors[mode].typography.typo1 })
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
  const { asset } = useEarnManagementState();
  const fetchedToken = useToken({ tokenAddress: asset?.address, chainId: asset?.chainId });

  if (!asset) return null;

  let token = asset;
  if (isNil(token?.price) && !isNil(fetchedToken?.price)) {
    token = fetchedToken;
  }

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
  const depositFeeAmount = calculateEarnFeeBigIntAmount({
    strategy,
    assetAmount: depositAmount,
    feeType: FeeType.DEPOSIT,
  });
  if (depositFeeAmount) {
    feeAmounts = {
      amount: depositFeeAmount,
      amountInUnits: formatCurrencyAmount({
        amount: depositFeeAmount,
        token,
        intl,
      }),
      amountInUSD: parseUsdPrice(token, depositFeeAmount, parseNumberUsdPriceToBigInt(token.price)).toFixed(2),
    };
  }

  return (
    <ContainerBox gap={5} flexWrap="wrap" flexDirection="column">
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
        <ContainerBox gap={1} alignItems="center">
          <RecapDataTitle>
            <FormattedMessage
              description="earn.strategy-management.deposit.tx-steps.recap-data.expected-earning.title"
              defaultMessage="Expected Earnings"
            />
          </RecapDataTitle>
          <Tooltip
            title={
              <FormattedMessage
                description="earn.strategy-management.deposit.tx-steps.recap-data.expected-earning.tooltip"
                defaultMessage="Expected earnings are calculated based on the apy of the strategy"
              />
            }
          >
            <ContainerBox>
              <InfoCircleIcon
                fontSize="small"
                sx={({ palette }) => ({ color: colors[palette.mode].typography.typo4 })}
              />
            </ContainerBox>
          </Tooltip>
        </ContainerBox>
        <ExpectedReturnsChangesSummary
          hidePeriods={[StrategyReturnPeriods.DAY]}
          strategy={strategy}
          assetAmount={assetAmountInUnits}
          operation={EarnOperationVariant.DEPOSIT}
        />
      </RecapDataContainer>
    </ContainerBox>
  );
};
export default EarnDepositRecapData;
