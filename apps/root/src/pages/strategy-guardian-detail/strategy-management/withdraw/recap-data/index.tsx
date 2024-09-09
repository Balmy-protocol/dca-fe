import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { colors, ContainerBox, Typography } from 'ui-library';
import ExpectedReturnsChangesSummary, { EarnOperationVariant } from '../../components/expected-returns-changes-summary';
import { calculateEarnFeeAmount, StrategyReturnPeriods } from '@common/utils/earn/parsing';
import { AmountsOfToken, FeeType, Token } from 'common-types';
import { formatCurrencyAmount, parseNumberUsdPriceToBigInt, parseUsdPrice } from '@common/utils/currency';
import { EarnWithdrawRecapDataProps } from '@common/components/transaction-steps/recap-data';
import { BalanceToken } from '@hooks/useMergedTokensBalances';
import TokenIconMultichain from '@pages/home/components/token-icon-multichain';

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

type TokenAmounts = {
  token: Token;
  amount: AmountsOfToken;
};

const EarnWithdrawRecapData = ({ strategy, withdraw }: EarnWithdrawRecapDataProps) => {
  const intl = useIntl();

  const withdrawAmounts = React.useMemo(() => {
    if (!withdraw || !strategy) return undefined;
    return withdraw.reduce<{ asset?: TokenAmounts; rewards: TokenAmounts[] }>(
      (acc, tokenAmount) => {
        const token = tokenAmount.token;
        const amount = tokenAmount.amount;
        const amounts = {
          amount,
          amountInUnits: formatCurrencyAmount({
            amount,
            token,
            intl,
          }),
          amountInUSD: parseUsdPrice(token, amount, parseNumberUsdPriceToBigInt(token.price)).toFixed(2),
        };

        if (token.address === strategy.asset.address) {
          // eslint-disable-next-line no-param-reassign
          acc.asset = { token, amount: amounts };
        } else {
          // eslint-disable-next-line no-param-reassign
          acc.rewards.push({ token, amount: amounts });
        }
        return acc;
      },
      {
        asset: undefined,
        rewards: [],
      }
    );
  }, [withdraw, intl, strategy?.asset]);

  const feeAmounts = React.useMemo(() => {
    if (!strategy || !strategy.asset || !withdrawAmounts || !withdrawAmounts.asset) return;

    const feeAmount = calculateEarnFeeAmount({
      strategy,
      feeType: FeeType.WITHDRAW,
      assetAmount: (withdrawAmounts.asset.amount.amount || 0n).toString(),
    });
    return {
      amount: feeAmount,
      amountInUnits: formatCurrencyAmount({
        amount: feeAmount,
        token: strategy.asset,
        intl,
      }),
      amountInUSD: parseUsdPrice(
        strategy?.asset,
        feeAmount,
        parseNumberUsdPriceToBigInt(strategy?.asset?.price)
      ).toFixed(2),
    };
  }, [strategy, withdrawAmounts?.asset]);

  const rewardsBalances = React.useMemo<BalanceToken[] | undefined>(
    () =>
      withdrawAmounts?.rewards.map((reward) => ({
        balance: reward.amount.amount,
        token: reward.token,
        isLoadingPrice: false,
        balanceUsd: reward.amount.amountInUSD ? Number(reward.amount.amountInUSD) : undefined,
        price: reward.token.price,
      })),
    [withdrawAmounts?.rewards]
  );

  return (
    <ContainerBox gap={5} flexWrap="wrap">
      <RecapDataContainer>
        <RecapDataTitle>
          <FormattedMessage
            description="earn.strategy-management.withdraw.tx-steps.recap-data.summary.title"
            defaultMessage="Summary"
          />
        </RecapDataTitle>
        <RecapDataGroupContainer>
          <RecapDataItemContainer>
            <RecapDataItemTitle>
              <FormattedMessage
                description="earn.strategy-management.withdraw.tx-steps.recap-data.summary.withdraw-amount.title"
                defaultMessage="Withdraw"
              />
            </RecapDataItemTitle>
            {withdrawAmounts && withdrawAmounts.asset && (
              <RecapDataItemValue>
                {withdrawAmounts.asset.amount.amountInUnits} {withdrawAmounts.asset.token.symbol}{' '}
                {withdrawAmounts.asset.amount.amountInUSD ? `($${withdrawAmounts.asset.amount.amountInUSD})` : ''}
              </RecapDataItemValue>
            )}
            {withdrawAmounts && rewardsBalances && !!rewardsBalances.length && (
              <RecapDataItemValue>
                {withdrawAmounts.asset ? '+' : ''}
                <TokenIconMultichain balanceTokens={rewardsBalances} />
                <FormattedMessage
                  defaultMessage="Rewards"
                  description="earn.strategy-management.withdraw.tx-steps.recap-data.summary.rewards.title"
                />
              </RecapDataItemValue>
            )}
          </RecapDataItemContainer>
          {feeAmounts && (
            <RecapDataItemContainer>
              <RecapDataItemTitle>
                <FormattedMessage
                  description="earn.strategy-management.withdraw.tx-steps.recap-data.summary.withdraw-fee.title"
                  defaultMessage="Withdraw Fee"
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
            description="earn.strategy-management.withdraw.tx-steps.recap-data.expected-earning.title"
            defaultMessage="Expected Earnings"
          />
        </RecapDataTitle>
        <ExpectedReturnsChangesSummary
          hidePeriods={[StrategyReturnPeriods.DAY]}
          strategy={strategy}
          size="small"
          assetAmount={(withdrawAmounts?.asset?.amount.amount || 0n).toString()}
          operation={EarnOperationVariant.WITHDRAW}
        />
      </RecapDataContainer>
    </ContainerBox>
  );
};
export default EarnWithdrawRecapData;
