import React from 'react';
import styled from 'styled-components';
import { SwapOption } from '@types';
import { Paper, Typography, colors, baseColors } from 'ui-library';

import { getBetterBy, getBetterByLabel, getWorseBy, getWorseByLabel } from '@common/utils/quotes';
import { SORT_MOST_PROFIT, SwapSortOptions } from '@constants/aggregator';
import TokenIcon from '@common/components/token-icon';
import { emptyTokenWithLogoURI, formatCurrencyAmount, emptyTokenWithDecimals } from '@common/utils/currency';
import { useIntl } from 'react-intl';
import { useThemeMode } from '@state/config/hooks';

const StyledContainer = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 22;
  border-radius: 20px;
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
  const mode = useThemeMode();

  const betterBy =
    selectedRoute && bestQuote && isBestQuote && getBetterBy(bestQuote, selectedRoute, sorting, isBuyOrder);
  const worseBy = quote && bestQuote && !isBestQuote && getWorseBy(bestQuote, quote, sorting, isBuyOrder);

  return (
    <StyledQuoteContainer onClick={() => onClick(quote)}>
      <StyledSwapperContainer>
        <TokenIcon isInChip size={5} token={emptyTokenWithLogoURI(quote.swapper.logoURI || '')} />
        <Typography variant="bodySmall" color={baseColors.white}>
          {quote.swapper.name}
        </Typography>
      </StyledSwapperContainer>
      <StyledWorseByContainer>
        <Typography
          variant="bodySmall"
          color={isBestQuote ? colors[mode].semantic.success.primary : colors[mode].semantic.error.primary}
        >
          {formatCurrencyAmount(betterBy || worseBy || 0n, emptyTokenWithDecimals(18), 3, 2)}{' '}
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
