import React from 'react';
import { ButtonProps, ContainerBox } from '..';
import { SvgIconProps, CustomSvgIcon } from '../svgicon';
import { colors } from '../../theme';
import styled from 'styled-components';

const NUMBER_SIZES_TO_HEIGHT: Record<'small' | 'medium' | 'large', number> = {
  small: 18,
  medium: 24,
  large: 32,
};

const StyledContainerBox = styled(ContainerBox)<{ size: ButtonProps['size'] }>`
  ${({ size }) => `height: ${NUMBER_SIZES_TO_HEIGHT[size || 'medium']}px;`}
  display: inline-flex;
`;
interface IconProps extends SvgIconProps {
  size?: string;
}

export default function CircleIcon({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon
      viewBox="0 0 100 100"
      style={size ? { fontSize: size } : {}}
      {...props}
      sx={{ color: ({ palette: { mode } }) => colors[mode].typography.typo5 }}
    >
      <circle cx="50" cy="50" r="50" />
    </CustomSvgIcon>
  );
}

const NUMBER_SIZES_TO_REM: Record<'small' | 'medium' | 'large', number> = {
  small: 0.625,
  medium: 0.75,
  large: 1,
};
const CIRCLES_TO_USE = 4;

const circles = Array.from(Array(CIRCLES_TO_USE).keys());

interface HiddenNumberProps {
  size?: ButtonProps['size'];
}

const HiddenNumber = ({ size = 'medium' }: HiddenNumberProps) => (
  <StyledContainerBox gap={1} alignItems="center" justifyContent="center" size={size}>
    {circles.map((key) => (
      <CircleIcon size={`${NUMBER_SIZES_TO_REM[size]}rem`} key={key} />
    ))}
  </StyledContainerBox>
);

export { HiddenNumber, HiddenNumberProps };
