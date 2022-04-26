import React from 'react';
import styled from 'styled-components';
import CircularProgress from '@mui/material/CircularProgress';

const StyledLoadingIndicatorWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

interface CenteredLoadingIndicatorProps {
  size?: number;
}

export const DEFAULT_SIZE = 40;

const CenteredLoadingIndicator = ({ size }: CenteredLoadingIndicatorProps) => (
  <StyledLoadingIndicatorWrapper>
    <CircularProgress size={size || DEFAULT_SIZE} />
  </StyledLoadingIndicatorWrapper>
);

export default CenteredLoadingIndicator;
