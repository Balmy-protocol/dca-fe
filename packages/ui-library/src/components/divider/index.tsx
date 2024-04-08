import type { DividerProps } from '@mui/material/Divider';
import Divider from '@mui/material/Divider';
import styled from 'styled-components';
import { colors } from '../../theme';

const DividerBorderAccent = styled(Divider)`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
    border-color: ${colors[mode].border.accent};
  `}
`;

const DividerBorder1 = styled(Divider)`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
    border-color: ${colors[mode].border.border1};
  `}
`;

const DividerBorder2 = styled(Divider)`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
  border-color: ${colors[mode].border.border2};
`}
`;

export { Divider, type DividerProps, DividerBorderAccent, DividerBorder1, DividerBorder2 };
