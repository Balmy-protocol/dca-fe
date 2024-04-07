import * as React from 'react';
import styled from 'styled-components';
import { SwapOption, Token } from '@types';
import { Typography, Tooltip, HelpOutlineIcon, ContainerBox, Divider } from 'ui-library';
import { formatCurrencyAmount } from '@common/utils/currency';
import { FormattedMessage } from 'react-intl';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { getProtocolToken } from '@common/mocks/tokens';

const StyledQuoteDataItem = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledMinimumContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StyledContainer = styled(ContainerBox).attrs(() => ({
  flexDirection: 'column',
  gap: 3,
}))`
  ${({ theme: { spacing } }) => `
    padding: 0px ${spacing(10)};
  `}
`;

interface QuoteDataProps {
  quote: SwapOption | null;
  to: Token | null;
  isBuyOrder: boolean;
}

const QuoteData = ({ quote, to, isBuyOrder }: QuoteDataProps) => {
  const network = useSelectedNetwork();

  const protocolToken = getProtocolToken(network.chainId);

  return (
    <ContainerBox flexDirection="column" gap={3}>
      <Divider />
      <StyledContainer>
        <StyledQuoteDataItem>
          <Typography variant="bodySmall" fontWeight={700}>
            <FormattedMessage description="quoteDataFee" defaultMessage="Transaction cost:" />
          </Typography>
          <Typography variant="bodySmall" fontWeight={700}>
            {quote?.gas?.estimatedCostInUSD
              ? `$${quote.gas.estimatedCostInUSD.toFixed(2)} (${formatCurrencyAmount(
                  quote.gas.estimatedCost,
                  protocolToken,
                  2,
                  2
                )} ${protocolToken.symbol})`
              : '-'}
          </Typography>
        </StyledQuoteDataItem>
        {isBuyOrder && (
          <StyledQuoteDataItem>
            <Typography variant="bodySmall" fontWeight={700}>
              <FormattedMessage description="quoteDataMaxSent" defaultMessage="Maximum spent:" />
            </Typography>
            <StyledMinimumContainer>
              <Typography variant="bodySmall" fontWeight={700}>
                {quote?.maxSellAmount.amount
                  ? `${formatCurrencyAmount(quote?.maxSellAmount.amount, quote?.sellToken, 4, 6)} ${quote?.sellToken
                      .symbol}`
                  : '-'}
                <Tooltip
                  title={
                    <FormattedMessage
                      description="quoteDataMaximumTooltip"
                      defaultMessage="This is the maximum you will spend based on your slippage settings"
                    />
                  }
                  arrow
                  placement="top"
                >
                  <HelpOutlineIcon color="inherit" fontSize="inherit" />
                </Tooltip>
              </Typography>
            </StyledMinimumContainer>
          </StyledQuoteDataItem>
        )}
        {!isBuyOrder && (
          <StyledQuoteDataItem>
            <Typography variant="bodySmall" fontWeight={700}>
              <FormattedMessage description="quoteDataRate" defaultMessage="Minimum received:" />
            </Typography>
            <StyledMinimumContainer>
              <Typography variant="bodySmall" fontWeight={700} sx={{ display: 'flex', alignItems: 'center' }}>
                {quote?.minBuyAmount.amount && to
                  ? `${formatCurrencyAmount(quote.minBuyAmount.amount, quote.buyToken, 4, 6)} ${quote.buyToken.symbol}`
                  : '-'}
                <Tooltip
                  title={
                    <FormattedMessage
                      description="quoteDataMinimumTooltip"
                      defaultMessage="This is the minimum you will receive based on your slippage settings"
                    />
                  }
                  arrow
                  placement="top"
                >
                  <HelpOutlineIcon color="inherit" fontSize="inherit" />
                </Tooltip>
              </Typography>
            </StyledMinimumContainer>
          </StyledQuoteDataItem>
        )}
      </StyledContainer>
    </ContainerBox>
  );
};

export default QuoteData;
