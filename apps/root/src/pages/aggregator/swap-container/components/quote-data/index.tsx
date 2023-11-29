import * as React from 'react';
import styled from 'styled-components';
import { SwapOption, Token } from '@types';
import { Typography, Tooltip, HelpOutlineIcon } from 'ui-library';
import { formatCurrencyAmount } from '@common/utils/currency';
import { FormattedMessage } from 'react-intl';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { getProtocolToken } from '@common/mocks/tokens';

const StyledQuoteDataContainer = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  background: rgba(216, 216, 216, 0.1);
  box-shadow: inset 1px 1px 0px rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.5);
  gap: 16px;
`;

const StyledQuoteDataItem = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledMinimumContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
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
    <StyledQuoteDataContainer>
      <StyledQuoteDataItem>
        <Typography variant="bodySmall" color="inherit">
          <FormattedMessage description="quoteDataFee" defaultMessage="Transaction cost:" />
        </Typography>
        <Typography variant="bodySmall">
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
      {isBuyOrder && quote?.maxSellAmount && quote?.maxSellAmount.amountInUnits !== quote?.sellAmount.amountInUnits && (
        <StyledQuoteDataItem>
          <Typography variant="bodySmall" color="inherit">
            <FormattedMessage description="quoteDataMaxSent" defaultMessage="Maximum spent:" />
          </Typography>
          <StyledMinimumContainer>
            <Typography variant="bodySmall" color="inherit">
              {quote.maxSellAmount.amount
                ? `${formatCurrencyAmount(quote.maxSellAmount.amount, quote.sellToken, 4, 6)} ${quote.sellToken.symbol}`
                : '-'}
            </Typography>
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
              <HelpOutlineIcon fontSize="small" />
            </Tooltip>
          </StyledMinimumContainer>
        </StyledQuoteDataItem>
      )}
      {quote?.minBuyAmount && quote?.minBuyAmount.amountInUnits !== quote?.buyAmount.amountInUnits && (
        <StyledQuoteDataItem>
          <Typography variant="bodySmall" color="inherit">
            <FormattedMessage description="quoteDataRate" defaultMessage="Minimum received:" />
          </Typography>
          <StyledMinimumContainer>
            <Typography variant="bodySmall" color="inherit">
              {quote?.minBuyAmount.amount && to
                ? `${formatCurrencyAmount(quote.minBuyAmount.amount, quote.buyToken, 4, 6)} ${quote.buyToken.symbol}`
                : '-'}
            </Typography>
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
              <HelpOutlineIcon fontSize="small" />
            </Tooltip>
          </StyledMinimumContainer>
        </StyledQuoteDataItem>
      )}
    </StyledQuoteDataContainer>
  );
};

export default QuoteData;
