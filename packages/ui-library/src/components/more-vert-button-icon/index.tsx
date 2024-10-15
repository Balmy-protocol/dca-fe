import React from 'react';
import { IconButton, IconButtonProps, SvgIconProps } from '@mui/material';
import styled from 'styled-components';
import { colors } from '../../theme';
import { MoreVertIcon } from '../../icons';

interface MoreVertButtonIconProps extends IconButtonProps {
  $isActive?: boolean;
  fontSize?: SvgIconProps['fontSize'];
}

const MoreVertButtonIcon = styled(({ $isActive, fontSize = 'medium', ...props }: MoreVertButtonIconProps) => (
  <IconButton {...props}>
    <MoreVertIcon fontSize={fontSize} />
  </IconButton>
))<{ $isActive?: boolean }>`
  ${({ theme: { palette, spacing }, $isActive }) => `
  background: ${colors[palette.mode].background.secondary};
  border-radius: 50%;
  padding: ${spacing(2)};
  border: 1px solid ${colors[palette.mode].border.border1};
  :hover {
    background: ${colors[palette.mode].background.secondary};
  }
  ${
    $isActive &&
    `
  background: ${colors[palette.mode].background.emphasis};
  `
  }
`}
`;

export { MoreVertButtonIcon };
