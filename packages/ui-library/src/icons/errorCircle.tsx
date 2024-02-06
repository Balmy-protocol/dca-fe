import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';
import { useTheme } from 'styled-components';
import { colors } from '../theme';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function ErrorCircleIcon({ size = '162px', ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <CustomSvgIcon viewBox="0 0 131 131" style={{ fontSize: size }} {...props}>
      <circle opacity="0.4" cx="65.2344" cy="65.1855" r="65.1855" fill={colors[mode].semantic.error.light} />
      <circle cx="65.2344" cy="65.1855" r="52.5488" fill={colors[mode].semantic.error.primary} />
    </CustomSvgIcon>
  );
}
