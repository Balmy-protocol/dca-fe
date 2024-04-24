import TokenIcon from '@common/components/token-icon';
import {
  formatCurrencyAmount,
  getNetworkCurrencyTokens,
  parseNumberUsdPriceToBigInt,
  parseUsdPrice,
} from '@common/utils/currency';
import { NETWORKS } from '@constants';
import { useAggregatorState } from '@state/aggregator/hooks';
import { useThemeMode } from '@state/config/hooks';
import { compact, find } from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Box, ContainerBox, Divider, EastIcon, Typography, colors } from 'ui-library';
import TransferTo from '../transfer-to';
import { usePortfolioPrices } from '@state/balances/hooks';
import { formatUnits, parseUnits } from 'viem';

const RecapDataContainer = styled(ContainerBox).attrs({ flexDirection: 'column', alignItems: 'start' })``;

interface AmountsWithIconProps {
  icon: React.ReactElement;
  amount: string;
  amountUSD: string;
}

const AmountsWithIcon = ({ icon, amount, amountUSD }: AmountsWithIconProps) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      columnGap: 2,
      gridTemplateRows: 'auto auto',
    }}
  >
    <Box sx={{ gridColumn: '1', gridRow: '1', display: 'flex', alignItems: 'center' }}>{icon}</Box>
    <Box sx={{ gridColumn: '2', gridRow: '1' }}>
      <Typography variant="bodyBold">{amount}</Typography>
    </Box>
    <Box sx={{ gridColumn: '2', gridRow: '2', display: 'flex' }}>
      <Typography variant="bodySmallRegular">{amountUSD}</Typography>
    </Box>
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

  const network = find(NETWORKS, { chainId });
  if (!network || !selectedRoute) {
    return null;
  }

  const fromValueToUse =
    isBuyOrder && selectedRoute
      ? (selectedRoute?.sellToken.address === from?.address &&
          formatUnits(selectedRoute.sellAmount.amount, selectedRoute.sellToken.decimals)) ||
        '0'
      : fromValue;
  const toValueToUse = isBuyOrder
    ? toValue
    : (selectedRoute &&
        selectedRoute?.buyToken.address === to?.address &&
        formatUnits(selectedRoute.buyAmount.amount, selectedRoute.buyToken.decimals || 18)) ||
      '0' ||
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
      <ContainerBox gap={8}>
        <ContainerBox gap={3} alignItems="center">
          <RecapDataContainer>
            <Typography variant="bodySmallRegular">
              <FormattedMessage description="youPay" defaultMessage="You pay" />
            </Typography>
            <AmountsWithIcon
              icon={<TokenIcon token={selectedRoute.sellToken} size={5} />}
              amount={`${formatCurrencyAmount(selectedRoute.sellAmount.amount, selectedRoute.sellToken, 2)} ${
                selectedRoute.sellToken.symbol
              }`}
              amountUSD={fromUsdValueToUse?.toString() || '-'}
            />
          </RecapDataContainer>
          <EastIcon sx={{ color: colors[themeMode].typography.typo3 }} />
          <RecapDataContainer>
            <Typography variant="bodySmallRegular">
              <FormattedMessage description="youReceive" defaultMessage="You receive" />
            </Typography>
            <AmountsWithIcon
              icon={<TokenIcon token={selectedRoute.buyToken} size={5} />}
              amount={`${formatCurrencyAmount(selectedRoute.buyAmount.amount, selectedRoute.buyToken, 2)} ${
                selectedRoute.buyToken.symbol
              }`}
              amountUSD={toUsdValueToUse?.toString() || '-'}
            />
          </RecapDataContainer>
        </ContainerBox>
        <Divider orientation="vertical" flexItem />
        <ContainerBox gap={6}>
          <RecapDataContainer>
            <Typography variant="bodySmallRegular">
              <FormattedMessage description="transactionCost" defaultMessage="Transaction cost" />
            </Typography>
            {selectedRoute.gas ? (
              <>
                <Typography variant="bodyBold">
                  {formatCurrencyAmount(selectedRoute.gas.estimatedCost, nativeCurrencyToken, 2)}{' '}
                  {selectedRoute.gas.gasTokenSymbol}
                </Typography>
                <Typography variant="bodySmallRegular" textAlign="center">
                  {selectedRoute.gas.estimatedCostInUSD ? `$${selectedRoute.gas.estimatedCostInUSD.toFixed(2)}` : '-'}
                </Typography>
              </>
            ) : (
              <Typography variant="bodyBold">-</Typography>
            )}
          </RecapDataContainer>
          <RecapDataContainer>
            <Typography variant="bodySmallRegular">
              <FormattedMessage description="network" defaultMessage="Network" />
            </Typography>
            <Typography variant="bodyBold">{network.name}</Typography>
          </RecapDataContainer>
        </ContainerBox>
      </ContainerBox>
    </>
  );
};
export default SwapRecapData;
