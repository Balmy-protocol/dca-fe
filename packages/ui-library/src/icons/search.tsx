import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function SearchIcon({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 25 24" style={size ? { fontSize: size } : {}} {...props}>
      <path d="M12.4766 21.75C6.82656 21.75 2.22656 17.15 2.22656 11.5C2.22656 5.85 6.82656 1.25 12.4766 1.25C18.1266 1.25 22.7266 5.85 22.7266 11.5C22.7266 17.15 18.1266 21.75 12.4766 21.75ZM12.4766 2.75C7.64656 2.75 3.72656 6.68 3.72656 11.5C3.72656 16.32 7.64656 20.25 12.4766 20.25C17.3066 20.25 21.2266 16.32 21.2266 11.5C21.2266 6.68 17.3066 2.75 12.4766 2.75Z" />
      <path d="M22.976 22.7495C22.786 22.7495 22.596 22.6795 22.446 22.5295L20.446 20.5295C20.156 20.2395 20.156 19.7595 20.446 19.4695C20.736 19.1795 21.216 19.1795 21.506 19.4695L23.506 21.4695C23.796 21.7595 23.796 22.2395 23.506 22.5295C23.356 22.6795 23.166 22.7495 22.976 22.7495Z" />
    </CustomSvgIcon>
  );
}
