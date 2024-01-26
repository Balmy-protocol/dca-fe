import { CSSProperties } from 'react';
import type { ButtonProps } from '@mui/material/Button';
import MuiButton from '@mui/material/Button';
import styled from 'styled-components';

const Button = styled(MuiButton)<{ maxWidth?: CSSProperties['maxWidth'] }>`
  max-width: ${({ maxWidth = '350px' }) => maxWidth};
`;

export { Button, type ButtonProps };
