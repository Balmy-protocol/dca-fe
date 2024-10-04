import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';
import { colors } from '../theme/colors';
import { useTheme } from 'styled-components';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function ModalSuccessCheckIcon({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();

  return (
    <CustomSvgIcon viewBox="0 0 74 74" style={size ? { fontSize: size } : {}} {...props}>
      <g>
        <circle cx="36.7793" cy="36.7793" r="36.7793" fill="#53ED9B" fillOpacity="0.4" />
        <circle cx="37.2197" cy="36.7783" r="29.6493" fill={colors[mode].semantic.success.primary} />
        <path
          d="M48.3243 28.8398L32.45 44.7142L25.2344 37.4986"
          stroke="#F6F6F9"
          strokeWidth="2.88624"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </CustomSvgIcon>
  );
}
