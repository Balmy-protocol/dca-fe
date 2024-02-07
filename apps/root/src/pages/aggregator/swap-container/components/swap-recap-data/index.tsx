import TokenIcon from '@common/components/token-icon';
import { formatCurrencyAmount, getNetworkCurrencyTokens } from '@common/utils/currency';
import { NETWORKS } from '@constants';
import { useAggregatorState } from '@state/aggregator/hooks';
import { useThemeMode } from '@state/config/hooks';
import { find } from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { ContainerBox, Divider, EastIcon, Typography, colors } from 'ui-library';

const RecapDataContainer = styled(ContainerBox).attrs({ flexDirection: 'column', alignItems: 'start' })``;

const SwapRecapData = () => {
  const { network: chainId, selectedRoute } = useAggregatorState();
  const themeMode = useThemeMode();

  const network = find(NETWORKS, { chainId });
  if (!network || !selectedRoute) {
    return null;
  }

  const { nativeCurrencyToken } = getNetworkCurrencyTokens(network);

  return (
    <ContainerBox gap={8}>
      <ContainerBox gap={3} alignItems="center">
        <RecapDataContainer>
          <Typography variant="bodySmall">
            <FormattedMessage description="youPay" defaultMessage="You pay" />
          </Typography>
          <ContainerBox gap={2} alignItems="center">
            <TokenIcon token={selectedRoute.sellToken} size={5} />
            <Typography variant="body" fontWeight="bold">
              {formatCurrencyAmount(selectedRoute.sellAmount.amount, selectedRoute.sellToken, 2)}{' '}
              {selectedRoute.sellToken.symbol}
            </Typography>
          </ContainerBox>
          <Typography variant="bodySmall" textAlign="center" pl={7}>
            {selectedRoute.sellAmount.amountInUSD ? `$${selectedRoute.sellAmount.amountInUSD.toFixed(2)}` : '-'}
          </Typography>
        </RecapDataContainer>
        <EastIcon sx={{ color: colors[themeMode].typography.typo3 }} />
        <RecapDataContainer>
          <Typography variant="bodySmall">
            <FormattedMessage description="youReceive" defaultMessage="You receive" />
          </Typography>
          <ContainerBox gap={2} alignItems="center">
            <TokenIcon token={selectedRoute.buyToken} size={5} />
            <Typography variant="body" fontWeight="bold">
              {formatCurrencyAmount(selectedRoute.buyAmount.amount, selectedRoute.buyToken, 2)}{' '}
              {selectedRoute.buyToken.symbol}
            </Typography>
          </ContainerBox>
          <Typography variant="bodySmall" textAlign="center" pl={7}>
            {selectedRoute.buyAmount.amountInUSD ? `$${selectedRoute.buyAmount.amountInUSD.toFixed(2)}` : '-'}
          </Typography>
        </RecapDataContainer>
      </ContainerBox>
      <Divider orientation="vertical" />
      <ContainerBox gap={6}>
        <RecapDataContainer>
          <Typography variant="bodySmall">
            <FormattedMessage description="transactionCost" defaultMessage="Transaction cost" />
          </Typography>
          {selectedRoute.gas ? (
            <>
              <Typography variant="body" fontWeight="bold">
                {formatCurrencyAmount(selectedRoute.gas.estimatedCost, nativeCurrencyToken, 2)}{' '}
                {selectedRoute.gas.gasTokenSymbol}
              </Typography>
              <Typography variant="bodySmall" textAlign="center">
                {selectedRoute.gas.estimatedCostInUSD ? `$${selectedRoute.gas.estimatedCostInUSD.toFixed(2)}` : '-'}
              </Typography>
            </>
          ) : (
            <Typography variant="body" fontWeight="bold">
              -
            </Typography>
          )}
        </RecapDataContainer>
        <RecapDataContainer>
          <Typography variant="bodySmall">
            <FormattedMessage description="network" defaultMessage="Network" />
          </Typography>
          <Typography variant="body" fontWeight="bold">
            {network.name}
          </Typography>
        </RecapDataContainer>
      </ContainerBox>
    </ContainerBox>
  );
};
export default SwapRecapData;
