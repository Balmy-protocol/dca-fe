import React from 'react';
import styled from 'styled-components';
import { ContainerBox } from '../components';
import { SvgIconProps } from '@mui/material';
import { ArrowRightLightIcon } from '.';

const AnimatedArrowRightLight = styled((props: SvgIconProps) => (
  <ContainerBox alignItems="center" flex={1} justifyContent="center">
    <ArrowRightLightIcon {...props} sx={{ flex: '1' }} />
  </ContainerBox>
))<{ $hovered?: boolean }>`
  ${({ $hovered, theme: { spacing } }) => `
    transition: transform 0.15s ease;
    transform: translateX(${$hovered ? spacing(1) : 0});
  `}
`;

export default AnimatedArrowRightLight;
