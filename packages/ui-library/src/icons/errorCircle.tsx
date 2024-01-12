import React from 'react';
import { CustomSvgIcon, SvgIcon, SvgIconProps } from '../components/svgicon';
import { useTheme } from 'styled-components';
import { colors } from '../theme';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function ErrorCircleIcon({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <CustomSvgIcon viewBox="0 0 131 131" style={size ? { fontSize: size } : {}} {...props}>
      <circle opacity="0.4" cx="65.2344" cy="65.1855" r="65.1855" fill={colors[mode].semantic.error} />
      <SvgIcon viewBox="0 0 106 106">
        <circle cx="53.2344" cy="53.1855" r="52.5488" fill={colors[mode].semantic.error} />
      </SvgIcon>
    </CustomSvgIcon>
  );
}
