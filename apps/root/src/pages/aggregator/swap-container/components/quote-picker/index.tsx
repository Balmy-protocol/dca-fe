import React from 'react';
import styled from 'styled-components';
import { SwapOption } from '@types';
import { Typography, colors, ContainerBox, Popover, TokenPickerButton, ForegroundPaper } from 'ui-library';
import { getBetterBy, getBetterByLabel, getWorseBy, getWorseByLabel } from '@common/utils/quotes';
import { SwapSortOptions } from '@constants/aggregator';
import TokenIcon from '@common/components/token-icon';
import { emptyTokenWithLogoURI, formatCurrencyAmount, emptyTokenWithDecimals, toToken } from '@common/utils/currency';
import { defineMessage, useIntl } from 'react-intl';
import { useThemeMode } from '@state/config/hooks';
import { formatSwapDiffLabel } from '@common/utils/swap';
import { useAggregatorState } from '@state/aggregator/hooks';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import { useAppDispatch } from '@state/hooks';
import useAnalytics from '@hooks/useAnalytics';
import { setSelectedRoute } from '@state/aggregator/actions';

const StyledContainer = styled(ForegroundPaper)`
  ${({ theme: { spacing } }) => `
  padding: ${spacing(3)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};
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
        <TokenIcon isInChip size={6} token={emptyTokenWithLogoURI(quote.swapper.logoURI || '')} />
        <Typography variant="bodySmallRegular">{quote.swapper.name}</Typography>
      </ContainerBox>
      <ContainerBox flexDirection="column" justifyContent="center" alignItems="end">
        <Typography
          variant="bodySmallBold"
          color={isBestQuote ? colors[mode].semantic.success.darker : colors[mode].semantic.error.darker}
        >
          {formatSwapDiffLabel(
            formatCurrencyAmount({
              amount: betterBy || worseBy || 0n,
              token: emptyTokenWithDecimals(18),
              sigFigs: 3,
              maxDecimals: 2,
              intl,
            }),
            sorting,
            isBestQuote
          )}
        </Typography>
        <Typography variant="labelRegular">
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
  isBuyOrder: boolean;
  onClick: (quote: SwapOption) => void;
}

const QuoteList = ({ quotes, bestQuote, selectedRoute, isBuyOrder, onClick }: QuoteListProps) => {
  const { sorting } = useAggregatorSettingsState();

  return (
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
};

interface QuotePickerProps {
  quotes: SwapOption[];
  bestQuote?: SwapOption | null;
  isLoading: boolean;
  isBuyOrder: boolean;
}

const QuotePicker = ({ quotes, isLoading, bestQuote, isBuyOrder }: QuotePickerProps) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const dispatch = useAppDispatch();
  const { trackEvent } = useAnalytics();
  const intl = useIntl();
  const { selectedRoute } = useAggregatorState();

  const handleClose = () => {
    setAnchorEl(null);
    trackEvent('Aggregator - Close quote picker');
  };

  const changeSelectedRoute = (newRoute: SwapOption) => {
    dispatch(setSelectedRoute(newRoute));
    trackEvent('Aggregator - Change selected route', {
      fromSource: selectedRoute?.swapper.id,
      toSource: newRoute.swapper.id,
    });
    setAnchorEl(null);
  };

  const handleOpenQuoteList = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    trackEvent('Aggregator - Open quote picker');
  };

  const open = Boolean(anchorEl);
  const id = open ? 'quotes-popover' : undefined;

  return (
    <>
      <TokenPickerButton
        onClick={handleOpenQuoteList}
        showAction={quotes.length > 1 && !isLoading}
        disabled={!selectedRoute || isLoading}
        token={
          (selectedRoute && {
            ...toToken({ symbol: selectedRoute?.swapper.name }),
            icon: (
              <TokenIcon
                isInChip
                token={!isLoading ? emptyTokenWithLogoURI(selectedRoute.swapper.logoURI || '') : undefined}
              />
            ),
          }) ||
          undefined
        }
        defaultText={intl.formatMessage(
          defineMessage({
            description: 'swapSource',
            defaultMessage: 'Swap Source',
          })
        )}
        isLoading={isLoading}
      />
      <Popover anchorEl={anchorEl} id={id} open={!isLoading && open} onClose={handleClose}>
        <QuoteList
          quotes={quotes}
          bestQuote={bestQuote}
          isBuyOrder={isBuyOrder}
          onClick={changeSelectedRoute}
          selectedRoute={selectedRoute}
        />
      </Popover>
    </>
  );
};

export default QuotePicker;
