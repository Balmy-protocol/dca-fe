import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';
import { useTheme } from 'styled-components';
import { colors } from '../theme';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function WarningTriangleIcon({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <CustomSvgIcon viewBox="0 0 24 24" style={size ? { fontSize: size } : {}} {...props}>
      <path
        d="M21.5259 18.5L12.8657 3.5C12.4808 2.83333 11.5185 2.83333 11.1336 3.5L2.47336 18.5C2.08846 19.1667 2.56958 20 3.33938 20H20.6599C21.4297 20 21.9108 19.1667 21.5259 18.5Z"
        stroke={colors[mode].semantic.error.darker}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M13 16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16C11 15.4477 11.4477 15 12 15C12.5523 15 13 15.4477 13 16Z"
        fill={colors[mode].semantic.error.darker}
      />
      <path
        d="M12 13L12 10"
        stroke={colors[mode].semantic.error.darker}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </CustomSvgIcon>
  );
}
