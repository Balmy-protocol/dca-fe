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

const StyledCurrentValueBold = styled(Typography).attrs({ variant: 'bodyBold' })`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo4}
    `}
`;
const StyledCurrentValueRegular = styled(Typography).attrs({ variant: 'bodyRegular' })`
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
  const remainingLiquidity = rate.amount * remainingSwaps;

  const parsedFromValue = parseUnits(fromValue, from.decimals);
  const parsedRateValue = parseUnits(rateValue, from.decimals);
  const currentFromUsdValue = parseUsdPrice(from, remainingLiquidity, fromPrice);
  const newFromUsdValue = parseUsdPrice(from, parsedFromValue, fromPrice);
  const currentRateUsdValue = parseUsdPrice(from, rate.amount, fromPrice);
  const newRateUsdValue = parseUsdPrice(from, parsedRateValue, fromPrice);

  const hasYield = !!from.underlyingTokens.length;

  return (
    <ContainerBox flexDirection="column" gap={3} alignItems="start">
      <Typography variant="h6" fontWeight={700}>
        <FormattedMessage description="changesSummary" defaultMessage="Changes summary" />
      </Typography>
      <ContainerBox justifyContent="space-between" gap={2} flex={1} alignSelf="stretch">
        <ContainerBox flexDirection="column" alignItems="start">
          <Typography variant="bodySmallRegular">
            <FormattedMessage description="totalInvested" defaultMessage="Total invested" />
          </Typography>
          <ContainerBox gap={0.5} alignItems="center">
            <StyledCurrentValueBold>
              {formatCurrencyAmount(remainingLiquidity, from, 2)} {from.symbol}
            </StyledCurrentValueBold>
            <StyledCurrentValueRegular>(${usdFormatter(currentFromUsdValue, 2)})</StyledCurrentValueRegular>
          </ContainerBox>
          <StyledArrowIcon />
          {parsedFromValue === remainingLiquidity ? (
            <StyledCurrentValueBold>=</StyledCurrentValueBold>
          ) : (
            <ContainerBox gap={0.5} alignItems="center">
              <Typography variant="bodyBold">
                {formatCurrencyAmount(parsedFromValue, from, 2)} {from.symbol}
              </Typography>
              <Typography variant="bodyRegular">(${usdFormatter(newFromUsdValue, 2)})</Typography>
            </ContainerBox>
          )}
        </ContainerBox>
        <ContainerBox flexDirection="column" alignItems="start">
          <Typography variant="bodySmallRegular">
            <FormattedMessage description="duration" defaultMessage="Duration" />
          </Typography>
          <StyledCurrentValueBold>
            {getTimeFrequencyLabel(intl, swapInterval.toString(), remainingSwaps.toString())}
          </StyledCurrentValueBold>
          <StyledArrowIcon />
          {frequencyValue === remainingSwaps.toString() ? (
            <StyledCurrentValueBold>=</StyledCurrentValueBold>
          ) : (
            <Typography variant="bodyBold">
              {getTimeFrequencyLabel(intl, swapInterval.toString(), frequencyValue)}
            </Typography>
          )}
        </ContainerBox>
        <ContainerBox flexDirection="column" alignItems="start">
          <Typography variant="bodySmallRegular">
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
          <ContainerBox gap={0.5} alignItems="center">
            <StyledCurrentValueBold>
              {formatCurrencyAmount(rate.amount, from, 2)} {from.symbol}
            </StyledCurrentValueBold>
            <StyledCurrentValueRegular>(${usdFormatter(currentRateUsdValue, 2)})</StyledCurrentValueRegular>
            {hasYield && (
              <StyledCurrentValueRegular>
                <FormattedMessage description="plusYield" defaultMessage="+ yield" />
              </StyledCurrentValueRegular>
            )}
          </ContainerBox>
          <StyledArrowIcon />
          {parsedRateValue === rate.amount ? (
            <StyledCurrentValueBold>=</StyledCurrentValueBold>
          ) : (
            <ContainerBox gap={0.5} alignItems="center">
              <Typography variant="bodyBold">
                {formatCurrencyAmount(parsedRateValue, from, 2)} {from.symbol}
              </Typography>
              <Typography variant="bodyRegular">(${usdFormatter(newRateUsdValue, 2)})</Typography>
              {hasYield && (
                <Typography variant="bodyRegular">
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
