import React from 'react';
import styled from 'styled-components';
import { SwapOption } from '@types';
import { Paper, Typography, colors, ContainerBox } from 'ui-library';
import { getBetterBy, getBetterByLabel, getWorseBy, getWorseByLabel } from '@common/utils/quotes';
import { SwapSortOptions } from '@constants/aggregator';
import TokenIcon from '@common/components/token-icon';
import { emptyTokenWithLogoURI, formatCurrencyAmount, emptyTokenWithDecimals } from '@common/utils/currency';
import { useIntl } from 'react-intl';
import { useThemeMode } from '@state/config/hooks';
import { formatSwapDiffLabel } from '@common/utils/swap';

const StyledContainer = styled(Paper)`
  ${({ theme: { palette, spacing } }) => `
  padding: ${spacing(3)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};
  border: 1px solid ${colors[palette.mode].border.border2};
  max-height: ${spacing(60)};
  overflow: auto;
  `}
`;

const StyledQuoteContainer = styled(ContainerBox).attrs({
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 3,
})`
  ${({ theme: { palette, spacing } }) => `
  cursor: pointer;
  padding: ${spacing(2)};
  border-radius: ${spacing(2)};
  &:hover {
    background: ${colors[palette.mode].background.emphasis};
  }
  `}
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
      <ContainerBox alignItems="center" gap={2}>
        <TokenIcon isInChip size={5} token={emptyTokenWithLogoURI(quote.swapper.logoURI || '')} />
        <Typography variant="bodySmall">{quote.swapper.name}</Typography>
      </ContainerBox>
      <ContainerBox flexDirection="column" justifyContent="center" alignItems="end">
        <Typography
          variant="bodySmall"
          color={isBestQuote ? colors[mode].semantic.success.darker : colors[mode].semantic.error.darker}
          fontWeight={700}
        >
          {formatSwapDiffLabel(
            formatCurrencyAmount(betterBy || worseBy || 0n, emptyTokenWithDecimals(18), 3, 2),
            sorting
          )}
        </Typography>
        <Typography variant="caption">
          {isBestQuote
            ? intl.formatMessage(getBetterByLabel(sorting, isBuyOrder))
            : intl.formatMessage(getWorseByLabel(sorting, isBuyOrder))}
        </Typography>
      </ContainerBox>
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
