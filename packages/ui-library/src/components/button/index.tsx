import { CSSProperties } from 'react';
import type { ButtonProps } from '@mui/material/Button';
import MuiButton from '@mui/material/Button';
import styled from 'styled-components';

const Button = styled(MuiButton)<{ maxWidth?: CSSProperties['maxWidth'] }>`
  ${({ theme: { spacing }, maxWidth }) => `
  max-width: ${maxWidth ?? spacing(87.5)};
`}
`;

export { Button, type ButtonProps };
