import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';
import { useTheme } from 'styled-components';
import { colors } from '../theme';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function WarningCircleIcon({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <CustomSvgIcon viewBox="0 0 24 25" style={size ? { fontSize: size } : {}} {...props}>
      <path
        d="M12 21.25C16.9706 21.25 21 17.2206 21 12.25C21 7.27944 16.9706 3.25 12 3.25C7.02944 3.25 3 7.27944 3 12.25C3 17.2206 7.02944 21.25 12 21.25Z"
        stroke={colors[mode].semantic.warning.darker}
        strokeWidth="1.6"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M13 15.25C13 15.8023 12.5523 16.25 12 16.25C11.4477 16.25 11 15.8023 11 15.25C11 14.6977 11.4477 14.25 12 14.25C12.5523 14.25 13 14.6977 13 15.25Z"
        fill={colors[mode].semantic.warning.darker}
      />
      <path
        d="M12 12.25L12 8.25"
        stroke={colors[mode].semantic.warning.darker}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </CustomSvgIcon>
  );
}
