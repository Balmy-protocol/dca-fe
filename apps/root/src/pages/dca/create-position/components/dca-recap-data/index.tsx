import TokenIcon from '@common/components/token-icon';
import { formatCurrencyAmount, parseNumberUsdPriceToBigInt, parseUsdPrice } from '@common/utils/currency';
import { getTimeFrequencyLabel, usdFormatter } from '@common/utils/parsing';
import { STRING_SWAP_INTERVALS } from '@constants';
import { useCreatePositionState } from '@state/create-position/hooks';
import { capitalize } from 'lodash';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ContainerBox, Divider, Typography } from 'ui-library';
import { parseUnits } from 'viem';

const DcaRecapData = () => {
  const intl = useIntl();
  const { frequencyType, rate, from, to, fromYield, fromValue, toYield, frequencyValue } = useCreatePositionState();
  if (!from || !to) {
    return;
  }

  const parsedFromValue = parseUnits(fromValue, from.decimals);
  const parsedRate = parseUnits(rate, from.decimals);
  const fromUsdValue = parseUsdPrice(from, parsedFromValue, parseNumberUsdPriceToBigInt(from.price));

  return (
    <ContainerBox gap={6}>
      <ContainerBox flexDirection="column" gap={4}>
        <ContainerBox flexDirection="column">
          <Typography variant="bodySmallRegular">
            <FormattedMessage
              description="youPayPerInterval"
              defaultMessage="You pay per {interval}"
              values={{
                interval: intl.formatMessage(STRING_SWAP_INTERVALS[frequencyType.toString()].singularSubject),
              }}
            />
          </Typography>
          <ContainerBox gap={2} alignItems="center">
            <TokenIcon token={from} size={5} />
            <ContainerBox gap={0.5}>
              <Typography variant="bodyBold">
                {formatCurrencyAmount(parsedRate, from, 2)} {from.symbol}
              </Typography>
              {fromYield && (
                <Typography variant="bodyRegular">
                  <FormattedMessage description="plusYield" defaultMessage="+ yield" />
                </Typography>
              )}
            </ContainerBox>
          </ContainerBox>
        </ContainerBox>
        <ContainerBox flexDirection="column">
          <Typography variant="bodySmallRegular">
            <FormattedMessage description="total" defaultMessage="Total" />
          </Typography>
          <ContainerBox gap={2} alignItems="center">
            <TokenIcon token={from} size={5} />
            <ContainerBox gap={0.5}>
              <Typography variant="bodyBold" noWrap>
                {formatCurrencyAmount(parsedFromValue, from, 2)} {from.symbol}
              </Typography>
              {from.price && <Typography variant="bodyRegular">(${usdFormatter(fromUsdValue, 2)})</Typography>}
            </ContainerBox>
          </ContainerBox>
        </ContainerBox>
      </ContainerBox>
      <Divider orientation="vertical" flexItem />

      <ContainerBox flexDirection="column" gap={4}>
        <ContainerBox flexDirection="column">
          <Typography variant="bodySmallRegular">
            <FormattedMessage description="frequency" defaultMessage="Frequency" />
          </Typography>
          <Typography variant="bodyBold">
            {capitalize(intl.formatMessage(STRING_SWAP_INTERVALS[frequencyType.toString()].adverb))}
          </Typography>
        </ContainerBox>
        <ContainerBox flexDirection="column">
          <Typography variant="bodySmallRegular">
            <FormattedMessage description="duration" defaultMessage="Duration" />
          </Typography>
          <Typography variant="bodyBold">
            {getTimeFrequencyLabel(intl, frequencyType.toString(), frequencyValue)}
          </Typography>
        </ContainerBox>
      </ContainerBox>

      {(fromYield || toYield) && (
        <ContainerBox flexDirection="column" gap={4}>
          {fromYield && (
            <ContainerBox flexDirection="column">
              <Typography variant="bodySmallRegular">
                <FormattedMessage description="yields" defaultMessage="Yields" />
              </Typography>
              <ContainerBox gap={2} alignItems="center">
                <TokenIcon token={from} size={5} />
                <ContainerBox gap={0.5}>
                  <Typography variant="bodyBold">{fromYield.name}</Typography>
                  <Typography variant="bodyRegular">(APY {fromYield.apy.toFixed(2)}%)</Typography>
                </ContainerBox>
              </ContainerBox>
            </ContainerBox>
          )}
          {toYield && (
            <ContainerBox flexDirection="column">
              <Typography variant="bodySmallRegular">
                <FormattedMessage description="yields" defaultMessage="Yields" />
              </Typography>
              <ContainerBox gap={2} alignItems="center">
                <TokenIcon token={to} size={5} />
                <ContainerBox gap={0.5}>
                  <Typography variant="bodyBold">{toYield.name}</Typography>
                  <Typography variant="bodyRegular">(APY {toYield.apy.toFixed(2)}%)</Typography>
                </ContainerBox>
              </ContainerBox>
            </ContainerBox>
          )}
        </ContainerBox>
      )}
    </ContainerBox>
  );
};

export default DcaRecapData;
