import React from 'react';
import styled from 'styled-components';
import { CircularProgress } from 'ui-library';

const StyledLoadingIndicatorWrapper = styled.div<{ noFlex?: boolean }>`
  display: flex;
  flex: ${({ noFlex }) => (noFlex ? '0' : '1')};
  align-items: center;
  justify-content: center;
`;

interface CenteredLoadingIndicatorProps {
  size?: number;
  noFlex?: boolean;
}

export const DEFAULT_SIZE = 40;

const CenteredLoadingIndicator = ({ size, noFlex }: CenteredLoadingIndicatorProps) => (
  <StyledLoadingIndicatorWrapper noFlex={noFlex}>
    <CircularProgress size={size || DEFAULT_SIZE} />
  </StyledLoadingIndicatorWrapper>
);

export default CenteredLoadingIndicator;
