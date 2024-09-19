import type { DividerProps } from '@mui/material/Divider';
import Divider from '@mui/material/Divider';
import styled from 'styled-components';
import { colors } from '../../theme';

const BaseDivider = styled(Divider)<{ $thin?: boolean }>`
  ${({ $thin = true }) => `
    ${$thin ? 'border-width: 0; border-bottom-width: thin;' : ''}
  `}
`;

const DividerBorderAccent = styled(BaseDivider)`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
    border-color: ${colors[mode].border.accent};
  `}
`;

const DividerBorder1 = styled(BaseDivider)`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
    border-color: ${colors[mode].border.border1};
  `}
`;

const DividerBorder2 = styled(BaseDivider)`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
  border-color: ${colors[mode].border.border2};
`}
`;

export { Divider, type DividerProps, DividerBorderAccent, DividerBorder1, DividerBorder2 };
