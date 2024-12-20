import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';
import { colors } from '../theme';
import { useTheme } from 'styled-components';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function SuccessOutlineIcon({ size, color, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <CustomSvgIcon viewBox="0 0 20 20" sx={{ fontSize: size }} {...props}>
      <path
        d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
        stroke={colors[mode].semantic.success.darker}
        strokeWidth="1.33333"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M12.5 8.33334L9.16667 11.6667L7.5 10"
        stroke={colors[mode].semantic.success.darker}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </CustomSvgIcon>
  );
}
