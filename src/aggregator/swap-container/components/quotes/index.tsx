import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import EmptyRoutes from 'assets/svg/emptyRoutes';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { SwapOption, Token } from 'types';
import SwapQuote from '../quote';
import QuoteRefresher from '../quote-refresher';
import QuoteSorter from '../quote-sorter';

const StyledPaper = styled(Paper)<{ $column?: boolean }>`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  background-color: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(6px);
  display: flex;
  gap: 24px;
  flex-direction: ${({ $column }) => ($column ? 'column' : 'row')};
  align-self: flex-start;
`;

const StyledTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledCenteredWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
`;

interface SwapQuotesProps {
  quotes: SwapOption[];
  isLoading: boolean;
  from: Token | null;
  to: Token | null;
  selectedRoute: SwapOption | null;
  setRoute: (newRoute: SwapOption) => void;
  setSorting: (newSort: string) => void;
  sorting: string;
  fetchOptions: () => void;
  refreshQuotes: boolean;
  isBuyOrder: boolean;
}

const SwapQuotes = ({
  quotes,
  isLoading,
  from,
  to,
  selectedRoute,
  setRoute,
  setSorting,
  sorting,
  fetchOptions,
  refreshQuotes,
  isBuyOrder,
}: SwapQuotesProps) => {
  if (!quotes.length && !isLoading) {
    return (
      <StyledPaper variant="outlined" $column>
        <StyledPaper variant="outlined">
          <StyledCenteredWrapper>
            <EmptyRoutes size="100px" />
            <Typography variant="h6">
              <FormattedMessage description="No route selected" defaultMessage="Fill the form to view route options" />
            </Typography>
          </StyledCenteredWrapper>
        </StyledPaper>
      </StyledPaper>
    );
  }

  return (
    <StyledPaper variant="outlined" $column>
      <StyledTitleContainer>
        <QuoteRefresher isLoading={isLoading} refreshQuotes={fetchOptions} disableRefreshQuotes={!refreshQuotes} />
        <QuoteSorter isLoading={isLoading} setQuoteSorting={setSorting} sorting={sorting} />
      </StyledTitleContainer>
      {isLoading && (
        <StyledCenteredWrapper>
          <CenteredLoadingIndicator size={40} />
          <FormattedMessage description="loadingBestRoute" defaultMessage="Fetching the best route for you" />
        </StyledCenteredWrapper>
      )}
      {!isLoading &&
        quotes.map((quote) => (
          <SwapQuote
            setRoute={setRoute}
            from={from}
            to={to}
            isSelected={quote.swapper.id === selectedRoute?.swapper.id}
            quote={quote}
            key={`${from?.symbol || ''}-${to?.symbol || ''}-${quote.swapper.id}`}
            isBuyOrder={isBuyOrder}
          />
        ))}
    </StyledPaper>
  );
};
export default SwapQuotes;
