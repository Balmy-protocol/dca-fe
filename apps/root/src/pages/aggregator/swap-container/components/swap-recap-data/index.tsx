import TokenIcon from '@common/components/token-icon';
import {
  formatCurrencyAmount,
  formatUsdAmount,
  getNetworkCurrencyTokens,
  parseNumberUsdPriceToBigInt,
  parseUsdPrice,
} from '@common/utils/currency';
import { NETWORKS } from '@constants';
import { useAggregatorState } from '@state/aggregator/hooks';
import { useThemeMode } from '@state/config/hooks';
import { compact, find } from 'lodash';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { Box, ContainerBox, DividerBorder1, EastIcon, Typography, colors } from 'ui-library';
import TransferTo from '../transfer-to';
import { usePortfolioPrices } from '@state/balances/hooks';
import { formatUnits, parseUnits } from 'viem';

const RecapDataContainer = styled(ContainerBox).attrs({ flexDirection: 'column', alignItems: 'start' })``;

interface AmountsWithIconProps {
  icon?: React.ReactElement;
  title: string;
  subTitle?: string;
  showIcon?: boolean;
}

const ValueWithIcon = ({ icon, title, subTitle, showIcon = true }: AmountsWithIconProps) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      columnGap: 2,
      gridTemplateRows: 'auto auto',
    }}
  >
    {showIcon && <Box sx={{ gridColumn: '1', gridRow: '1', display: 'flex', alignItems: 'center' }}>{icon}</Box>}
    <Box sx={{ gridColumn: showIcon ? '2' : '1', gridRow: '1' }}>
      <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
        {title}
      </Typography>
    </Box>
    {subTitle && (
      <Box sx={{ gridColumn: showIcon ? '2' : '1', gridRow: '2', display: 'flex' }}>
        <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo3}>
          {subTitle}
        </Typography>
      </Box>
    )}
  </Box>
);

const SwapRecapData = () => {
  const {
    network: chainId,
    selectedRoute,
    transferTo,
    from,
    to,
    isBuyOrder,
    fromValue,
    toValue,
  } = useAggregatorState();
  const themeMode = useThemeMode();
  const prices = usePortfolioPrices(compact([from, to]));
  const intl = useIntl();

  const network = find(NETWORKS, { chainId });
  if (!network || !selectedRoute) {
    return null;
  }

  const fromValueToUse =
    isBuyOrder && selectedRoute
      ? (selectedRoute?.sellToken.address === from?.address &&
          formatUnits(selectedRoute.sellAmount.amount, selectedRoute.sellToken.decimals)) ||
        '0.0'
      : fromValue;
  const toValueToUse = isBuyOrder
    ? toValue
    : (selectedRoute &&
        selectedRoute?.buyToken.address === to?.address &&
        formatUnits(selectedRoute.buyAmount.amount, selectedRoute.buyToken.decimals || 18)) ||
      '0.0' ||
      '';

  const fromUsdValueToUse =
    selectedRoute.sellAmount.amountInUSD ||
    (fromValueToUse &&
      fromValueToUse !== '' &&
      from &&
      prices[from.address] &&
      parseUsdPrice(
        from,
        parseUnits(fromValueToUse, from.decimals),
        parseNumberUsdPriceToBigInt(prices[from.address].price)
      )) ||
    undefined;
  const toUsdValueToUse =
    selectedRoute.buyAmount.amountInUSD ||
    (toValueToUse &&
      toValueToUse !== '' &&
      to &&
      prices[to.address] &&
      parseUsdPrice(
        to,
        parseUnits(toValueToUse, to.decimals),
        parseNumberUsdPriceToBigInt(prices[to.address].price)
      )) ||
    undefined;

  const { nativeCurrencyToken } = getNetworkCurrencyTokens(network);

  return (
    <>
      {transferTo && <TransferTo transferTo={transferTo} />}
      <ContainerBox gap={8} flexWrap="wrap">
        <ContainerBox gap={3} alignItems="center">
          <RecapDataContainer>
            <Typography variant="labelRegular">
              <FormattedMessage description="youPay" defaultMessage="You pay" />
            </Typography>
            <ValueWithIcon
              icon={<TokenIcon token={selectedRoute.sellToken} size={5} />}
              title={`${formatCurrencyAmount({
                amount: selectedRoute.sellAmount.amount,
                token: selectedRoute.sellToken,
                sigFigs: 2,
                intl,
              })} ${selectedRoute.sellToken.symbol}`}
              subTitle={
                fromUsdValueToUse?.toString() ? `$${formatUsdAmount({ intl, amount: fromUsdValueToUse })}` : '-'
              }
            />
          </RecapDataContainer>
          <EastIcon sx={{ color: colors[themeMode].typography.typo3 }} />
          <RecapDataContainer>
            <Typography variant="labelRegular">
              <FormattedMessage description="youReceive" defaultMessage="You receive" />
            </Typography>
            <ValueWithIcon
              icon={<TokenIcon token={selectedRoute.buyToken} size={5} />}
              title={`${formatCurrencyAmount({
                amount: selectedRoute.buyAmount.amount,
                token: selectedRoute.buyToken,
                sigFigs: 2,
                intl,
              })} ${selectedRoute.buyToken.symbol}`}
              subTitle={toUsdValueToUse ? `$${formatUsdAmount({ amount: toUsdValueToUse, intl })}` : '-'}
            />
          </RecapDataContainer>
        </ContainerBox>
        <DividerBorder1 orientation="vertical" flexItem />
        <ContainerBox gap={6}>
          <RecapDataContainer>
            <Typography variant="labelRegular">
              <FormattedMessage description="transactionCost" defaultMessage="Transaction cost" />
            </Typography>
            {selectedRoute.gas ? (
              <ValueWithIcon
                title={`${formatCurrencyAmount({
                  amount: selectedRoute.gas.estimatedCost,
                  token: nativeCurrencyToken,
                  sigFigs: 2,
                  intl,
                })} ${selectedRoute.gas.gasTokenSymbol}`}
                subTitle={`${
                  selectedRoute.gas.estimatedCostInUSD
                    ? `$${formatUsdAmount({ intl, amount: selectedRoute.gas.estimatedCostInUSD })}`
                    : '-'
                }`}
                showIcon={false}
                icon={<TokenIcon token={selectedRoute.buyToken} size={5} />}
              />
            ) : (
              <Typography variant="bodyBold" color={({ palette: { mode } }) => colors[mode].typography.typo3}>
                -
              </Typography>
            )}
          </RecapDataContainer>
          <RecapDataContainer>
            <Typography variant="labelRegular">
              <FormattedMessage description="network" defaultMessage="Network" />
            </Typography>
            <ValueWithIcon
              title={network.name}
              showIcon={false}
              icon={<TokenIcon token={selectedRoute.buyToken} size={5} />}
            />
          </RecapDataContainer>
        </ContainerBox>
      </ContainerBox>
    </>
  );
};
export default SwapRecapData;
