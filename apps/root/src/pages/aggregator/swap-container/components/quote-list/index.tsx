import React from 'react';
import styled from 'styled-components';
import { SwapOption } from '@types';
import Paper from '@mui/material/Paper';
import { BigNumber } from 'ethers';
import { getBetterBy, getBetterByLabel, getWorseBy, getWorseByLabel } from '@common/utils/quotes';
import { SORT_MOST_PROFIT, SwapSortOptions } from '@constants/aggregator';
import TokenIcon from '@common/components/token-icon';
import { emptyTokenWithLogoURI, formatCurrencyAmount, emptyTokenWithDecimals } from '@common/utils/currency';
import { Typography } from '@mui/material';
import { useIntl } from 'react-intl';

const StyledContainer = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  // background: rgba(39, 39, 39);
  // box-shadow: inset 1px 1px 0px rgba(0, 0, 0, 0.4);
  // border-radius: 4px;
  // color: rgba(255, 255, 255, 0.5);
  gap: 10px;
  z-index: 22;
  border-radius: 20px;
  background-color: #292929;
  backdrop-filter: blur(6px);
  max-height: 195px;
  overflow: auto;
`;

const StyledQuoteContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
`;

const StyledSwapperContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StyledWorseByContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
`;

interface QuoteItemProps {
  quote: SwapOption;
  bestQuote?: SwapOption | null;
  sorting: SwapSortOptions;
  isBuyOrder: boolean;
  onClick: (quote: SwapOption) => void;
  selectedRoute?: SwapOption | null;
}

const QuoteItem = ({ quote, bestQuote, sorting, isBuyOrder, selectedRoute, onClick }: QuoteItemProps) => {
  const intl = useIntl();
  const isBestQuote = bestQuote?.swapper.id === quote?.swapper.id;

  const betterBy =
    selectedRoute && bestQuote && isBestQuote && getBetterBy(bestQuote, selectedRoute, sorting, isBuyOrder);
  const worseBy = quote && bestQuote && !isBestQuote && getWorseBy(bestQuote, quote, sorting, isBuyOrder);

  return (
    <StyledQuoteContainer onClick={() => onClick(quote)}>
      <StyledSwapperContainer>
        <TokenIcon isInChip size="20px" token={emptyTokenWithLogoURI(quote.swapper.logoURI || '')} />
        <Typography variant="body2" color="#ffffff">
          {quote.swapper.name}
        </Typography>
      </StyledSwapperContainer>
      <StyledWorseByContainer>
        <Typography variant="body2" color={isBestQuote ? '#219653' : '#EB5757'}>
          {formatCurrencyAmount(betterBy || worseBy || BigNumber.from(0), emptyTokenWithDecimals(18), 3, 2)}{' '}
          {sorting === SORT_MOST_PROFIT ? ' USD' : '%'}
        </Typography>
        <Typography variant="caption">
          {isBestQuote
            ? intl.formatMessage(getBetterByLabel(sorting, isBuyOrder))
            : intl.formatMessage(getWorseByLabel(sorting, isBuyOrder))}
        </Typography>
      </StyledWorseByContainer>
    </StyledQuoteContainer>
  );
};

interface QuoteListProps {
  quotes: SwapOption[];
  bestQuote?: SwapOption | null;
  selectedRoute?: SwapOption | null;
  sorting: SwapSortOptions;
  isBuyOrder: boolean;
  onClick: (quote: SwapOption) => void;
}

const QuoteList = ({ quotes, bestQuote, sorting, selectedRoute, isBuyOrder, onClick }: QuoteListProps) => (
  <StyledContainer variant="outlined">
    {quotes
      .filter((quote) => quote.swapper.id !== selectedRoute?.swapper.id)
      .map((quote) => (
        <QuoteItem
          key={quote.id}
          selectedRoute={selectedRoute}
          onClick={onClick}
          quote={quote}
          bestQuote={bestQuote}
          sorting={sorting}
          isBuyOrder={isBuyOrder}
        />
      ))}
  </StyledContainer>
);

export default QuoteList;
