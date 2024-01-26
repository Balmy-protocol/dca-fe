import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';
import { useTheme } from 'styled-components';
import { colors } from '../theme';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function SuccessCircleIcon({ size = '162px', ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <CustomSvgIcon viewBox="0 0 131 131" style={{ fontSize: size }} {...props}>
      <circle cx="66.2559" cy="65.1855" r="52.5488" fill={colors[mode].semantic.success} />
      <path
        d="M85.9389 51.1172L57.8042 79.252L45.0156 66.4634"
        stroke={colors[mode].background.tertiary}
        strokeWidth="5.11541"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </CustomSvgIcon>
  );
}
