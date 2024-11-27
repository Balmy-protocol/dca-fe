import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function CloseIcon({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 10 11" style={size ? { fontSize: size } : {}} {...props}>
      <path
        stroke="currentColor"
        d="M0.664062 1.5L8.9974 9.83333M0.664062 9.83333L8.9974 1.5"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </CustomSvgIcon>
  );
}
