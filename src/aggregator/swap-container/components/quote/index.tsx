import Paper from '@mui/material/Paper';
import * as React from 'react';
import styled from 'styled-components';
import { SwapOption } from 'types';

const StyledPaper = styled(Paper)<{ $isFirst?: boolean }>`
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  flex-grow: 1;
  background-color: #292929;
  display: flex;
`;

const StyledTitleContainer = styled.div`
  display: flex;
  flex-grow: 1;
  padding: 16px 8px;
`;

interface SwapQuotesProps {
  quote: SwapOption;
  isFirst?: boolean;
}

const SwapQuote = ({ quote, isFirst }: SwapQuotesProps) => <StyledPaper $isFirst={isFirst}>quote</StyledPaper>;

export default SwapQuote;
