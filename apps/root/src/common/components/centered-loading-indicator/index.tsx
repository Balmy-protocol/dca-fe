import React from 'react';
import styled from 'styled-components';
import { CircularProgress, CircularProgressProps } from 'ui-library';

const StyledLoadingIndicatorWrapper = styled.div<{ noFlex?: boolean }>`
  display: flex;
  flex: ${({ noFlex }) => (noFlex ? '0' : '1')};
  align-items: center;
  justify-content: center;
`;

interface CenteredLoadingIndicatorProps {
  size?: number;
  noFlex?: boolean;
  color?: CircularProgressProps['color'];
}

export const DEFAULT_SIZE = 40;

const CenteredLoadingIndicator = ({ size, noFlex, color }: CenteredLoadingIndicatorProps) => (
  <StyledLoadingIndicatorWrapper noFlex={noFlex}>
    <CircularProgress size={size || DEFAULT_SIZE} color={color} />
  </StyledLoadingIndicatorWrapper>
);

export default CenteredLoadingIndicator;
