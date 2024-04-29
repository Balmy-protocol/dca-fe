import * as React from 'react';
import styled from 'styled-components';
import { SwapOption, Token } from '@types';
import { Typography, Tooltip, HelpOutlineIcon, ContainerBox, Divider } from 'ui-library';
import { formatCurrencyAmount, formatUsdAmount } from '@common/utils/currency';
import { FormattedMessage, useIntl } from 'react-intl';
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
  const intl = useIntl();
  const protocolToken = getProtocolToken(network.chainId);

  return (
    <ContainerBox flexDirection="column" gap={3}>
      <Divider />
      <StyledContainer>
        <StyledQuoteDataItem>
          <Typography variant="bodySmallBold">
            <FormattedMessage description="quoteDataFee" defaultMessage="Transaction cost:" />
          </Typography>
          <Typography variant="bodySmallBold">
            {quote?.gas?.estimatedCostInUSD
              ? `$${formatUsdAmount({ intl, amount: quote.gas.estimatedCostInUSD })} (${formatCurrencyAmount({
                  amount: quote.gas.estimatedCost,
                  token: protocolToken,
                  sigFigs: 2,
                  maxDecimals: 2,
                  intl,
                })} ${protocolToken.symbol})`
              : '-'}
          </Typography>
        </StyledQuoteDataItem>
        {isBuyOrder && (
          <StyledQuoteDataItem>
            <Typography variant="bodySmallBold">
              <FormattedMessage description="quoteDataMaxSent" defaultMessage="Maximum spent:" />
            </Typography>
            <StyledMinimumContainer>
              <Typography variant="bodySmallBold">
                {quote?.maxSellAmount.amount
                  ? `${formatCurrencyAmount({
                      amount: quote?.maxSellAmount.amount,
                      token: quote?.sellToken,
                      sigFigs: 4,
                      maxDecimals: 6,
                      intl,
                    })} ${quote?.sellToken.symbol}`
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
            <Typography variant="bodySmallBold">
              <FormattedMessage description="quoteDataRate" defaultMessage="Minimum received:" />
            </Typography>
            <StyledMinimumContainer>
              <Typography variant="bodySmallBold" sx={{ display: 'flex', alignItems: 'center' }}>
                {quote?.minBuyAmount.amount && to
                  ? `${formatCurrencyAmount({
                      amount: quote.minBuyAmount.amount,
                      token: quote.buyToken,
                      sigFigs: 4,
                      maxDecimals: 6,
                      intl,
                    })} ${quote.buyToken.symbol}`
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
