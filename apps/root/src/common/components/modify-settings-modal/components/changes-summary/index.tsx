import { formatCurrencyAmount, parseUsdPrice } from '@common/utils/currency';
import { getTimeFrequencyLabel, usdFormatter } from '@common/utils/parsing';
import { STRING_SWAP_INTERVALS } from '@constants';
import {
  useModifyRateSettingsFrequencyValue,
  useModifyRateSettingsFromValue,
  useModifyRateSettingsRate,
} from '@state/modify-rate-settings/hooks';
import { Position } from 'common-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { ArrowRightIcon, ContainerBox, Typography, colors } from 'ui-library';
import { parseUnits } from 'viem';

const StyledCurrentValue = styled(Typography).attrs({ variant: 'body' })`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo4}
    `}
`;

const StyledArrowIcon = styled(ArrowRightIcon)`
  transform: rotate(90deg);
  font-size: ${({ theme }) => theme.spacing(4)};
`;

interface ChangesSummaryProps {
  position: Position;
  fromPrice?: bigint;
}

const ChangesSummary = ({ position, fromPrice }: ChangesSummaryProps) => {
  const intl = useIntl();
  const fromValue = useModifyRateSettingsFromValue();
  const frequencyValue = useModifyRateSettingsFrequencyValue();
  const rateValue = useModifyRateSettingsRate();
  const { from, swapInterval, rate, remainingSwaps } = position;
  const remainingLiquidity = rate * remainingSwaps;

  const parsedFromValue = parseUnits(fromValue, from.decimals);
  const parsedRateValue = parseUnits(rateValue, from.decimals);
  const currentFromUsdValue = parseUsdPrice(from, remainingLiquidity, fromPrice);
  const newFromUsdValue = parseUsdPrice(from, parsedFromValue, fromPrice);
  const currentRateUsdValue = parseUsdPrice(from, rate, fromPrice);
  const newRateUsdValue = parseUsdPrice(from, parsedRateValue, fromPrice);

  const hasYield = !!from.underlyingTokens.length;

  return (
    <ContainerBox flexDirection="column" gap={3} alignItems="start">
      <Typography variant="h6" fontWeight={700}>
        <FormattedMessage description="changesSummary" defaultMessage="Changes summary" />
      </Typography>
      <ContainerBox justifyContent="space-between" gap={2}>
        <ContainerBox flexDirection="column" alignItems="start">
          <Typography variant="bodySmall">
            <FormattedMessage description="totalInvested" defaultMessage="Total invested" />
          </Typography>
          <ContainerBox gap={0.5}>
            <StyledCurrentValue fontWeight={700}>
              {formatCurrencyAmount(remainingLiquidity, from, 2)} {from.symbol}
            </StyledCurrentValue>
            <StyledCurrentValue>(${usdFormatter(currentFromUsdValue, 2)})</StyledCurrentValue>
          </ContainerBox>
          <StyledArrowIcon />
          {parsedFromValue === remainingLiquidity ? (
            <StyledCurrentValue fontWeight={700}>=</StyledCurrentValue>
          ) : (
            <ContainerBox gap={0.5}>
              <Typography variant="body" fontWeight={700}>
                {formatCurrencyAmount(parsedFromValue, from, 2)} {from.symbol}
              </Typography>
              <Typography variant="body">(${usdFormatter(newFromUsdValue, 2)})</Typography>
            </ContainerBox>
          )}
        </ContainerBox>
        <ContainerBox flexDirection="column" alignItems="start">
          <Typography variant="bodySmall">
            <FormattedMessage description="duration" defaultMessage="Duration" />
          </Typography>
          <StyledCurrentValue fontWeight={700}>
            {getTimeFrequencyLabel(intl, swapInterval.toString(), remainingSwaps.toString())}
          </StyledCurrentValue>
          <StyledArrowIcon />
          {frequencyValue === remainingSwaps.toString() ? (
            <StyledCurrentValue fontWeight={700}>=</StyledCurrentValue>
          ) : (
            <Typography variant="body" fontWeight={700}>
              {getTimeFrequencyLabel(intl, swapInterval.toString(), frequencyValue)}
            </Typography>
          )}
        </ContainerBox>
        <ContainerBox flexDirection="column" alignItems="start">
          <Typography variant="bodySmall">
            <FormattedMessage
              description="youPayPerInterval"
              defaultMessage="You pay per {interval}"
              values={{
                interval: intl.formatMessage(
                  STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].singularSubject
                ),
              }}
            />
          </Typography>
          <ContainerBox gap={0.5}>
            <StyledCurrentValue fontWeight={700}>
              {formatCurrencyAmount(rate, from, 2)} {from.symbol}
            </StyledCurrentValue>
            <StyledCurrentValue>(${usdFormatter(currentRateUsdValue, 2)})</StyledCurrentValue>
            {hasYield && (
              <StyledCurrentValue>
                <FormattedMessage description="plusYield" defaultMessage="+ yield" />
              </StyledCurrentValue>
            )}
          </ContainerBox>
          <StyledArrowIcon />
          {parsedRateValue === rate ? (
            <StyledCurrentValue fontWeight={700}>=</StyledCurrentValue>
          ) : (
            <ContainerBox gap={0.5}>
              <Typography variant="body" fontWeight={700}>
                {formatCurrencyAmount(parsedRateValue, from, 2)} {from.symbol}
              </Typography>
              <Typography variant="body">(${usdFormatter(newRateUsdValue, 2)})</Typography>
              {hasYield && (
                <Typography variant="body">
                  <FormattedMessage description="plusYield" defaultMessage="+ yield" />
                </Typography>
              )}
            </ContainerBox>
          )}
        </ContainerBox>
      </ContainerBox>
    </ContainerBox>
  );
};

export default ChangesSummary;
