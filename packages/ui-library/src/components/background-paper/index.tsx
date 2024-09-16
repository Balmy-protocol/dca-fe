import React from 'react';
import styled from 'styled-components';
import { Paper, PaperProps } from '../';
import { colors } from '../../theme';

const StyledBackgroundPaper = styled(Paper)`
  ${({
    theme: {
      palette: { mode },
      spacing,
      space,
    },
  }) => `
    background-color: ${colors[mode].background.quartery};
    border-radius: ${spacing(4)};
    padding: ${space.s06};
  `}
`;
const BackgroundPaper = ({ children, ...otherProps }: PaperProps) => (
  <StyledBackgroundPaper {...otherProps}>{children}</StyledBackgroundPaper>
);

export { BackgroundPaper };
