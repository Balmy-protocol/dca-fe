import React from 'react';
import styled from 'styled-components';
import { Paper, PaperProps } from '../';
import { colors } from '../../theme';

const StyledBackgroundPaper = styled(Paper)`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
    background-color: ${colors[mode].background.quartery};
    border-radius: ${spacing(4)};
    padding: ${spacing(10)} ${spacing(8)};
  `}
`;
const BackgroundPaper = ({ children, ...otherProps }: PaperProps) => (
  <StyledBackgroundPaper {...otherProps}>{children}</StyledBackgroundPaper>
);

export { BackgroundPaper };
