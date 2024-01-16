import React from 'react';
import styled from 'styled-components';
import { Paper, PaperProps } from '../';
import { colors } from '../../theme';

const StyledForegroundPaper = styled(Paper)`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
    background-color: ${colors[mode].background.secondary};
    border-radius: ${spacing(2)};
  `}
`;
const ForegroundPaper = ({ children, ...otherProps }: PaperProps) => (
  <StyledForegroundPaper {...otherProps}>{children}</StyledForegroundPaper>
);

export { ForegroundPaper };
