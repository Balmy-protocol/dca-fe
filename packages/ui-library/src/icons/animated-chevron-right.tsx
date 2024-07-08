import React from 'react';
import styled from 'styled-components';
import { ContainerBox } from '../components';
import { SvgIconProps } from '@mui/material';
import { ChevronRightIcon } from '.';

const AnimatedChevronRight = styled((props: SvgIconProps) => (
  <ContainerBox alignItems="center" flex={1} justifyContent="center">
    <ChevronRightIcon {...props} sx={{ flex: '1' }} />
  </ContainerBox>
))<{ $hovered: boolean }>`
  transition: transform 0.15s ease;
  ${({ $hovered, theme: { spacing } }) => `
  transform: translateX(${$hovered ? spacing(1) : 0});
  `}
`;

export default AnimatedChevronRight;
