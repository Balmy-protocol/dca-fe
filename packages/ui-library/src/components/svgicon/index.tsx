import React from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import SvgIcon from '@mui/material/SvgIcon';

interface CustomIconProps extends SvgIconProps {
  viewBox: string;
  size?: string;
}

const CustomSvgIcon = ({ viewBox, size, children, ...props }: CustomIconProps) => (
  <SvgIcon viewBox={viewBox} style={size ? { fontSize: size } : {}} {...props}>
    {children}
  </SvgIcon>
);

export { CustomSvgIcon, type CustomIconProps, SvgIcon, type SvgIconProps };
