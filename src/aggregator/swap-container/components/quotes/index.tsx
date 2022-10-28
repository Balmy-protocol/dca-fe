import Paper from '@mui/material/Paper';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import * as React from 'react';
import styled from 'styled-components';
import { SwapOption, Token } from 'types';
import SwapQuote from '../quote';

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
`;

interface SwapQuotesProps {
  quotes: SwapOption[];
  isLoading: boolean;
  from: Token | null;
  to: Token | null;
  selectedRoute: SwapOption | null;
  setRoute: (newRoute: SwapOption) => void;
}

const SwapQuotes = ({ quotes, isLoading, from, to, selectedRoute, setRoute }: SwapQuotesProps) => {
  if (isLoading) {
    return (
      <StyledPaper>
        <CenteredLoadingIndicator size={70} />
      </StyledPaper>
    );
  }

  return (
    <StyledPaper variant="outlined" $column>
      {quotes.map((quote) => (
        <SwapQuote
          setRoute={setRoute}
          from={from}
          to={to}
          isSelected={quote.swapper.id === selectedRoute?.swapper.id}
          quote={quote}
          key={quote.swapper.id}
        />
      ))}
    </StyledPaper>
  );
};
export default SwapQuotes;
