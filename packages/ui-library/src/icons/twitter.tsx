import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function TwitterIcon({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 300 271" style={size ? { fontSize: size } : {}} {...props}>
      <path d="m236 0h46l-101 115 118 156h-92.6l-72.5-94.8-83 94.8h-46l107-123-113-148h94.9l65.5 86.6zm-16.1 244h25.5l-165-218h-27.4z" />
    </CustomSvgIcon>
  );
}
