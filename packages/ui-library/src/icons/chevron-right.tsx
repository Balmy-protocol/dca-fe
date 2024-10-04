import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function ChevronRightIcon({ size, color, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 18 19" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.45522 12.3791C5.3138 12.2293 5.23502 12.0311 5.23502 11.8251C5.23502 11.6191 5.3138 11.4209 5.45522 11.2711L8.53622 8.00007L5.45522 4.73007C5.30815 4.57426 5.22901 4.36641 5.2352 4.15224C5.24139 3.93807 5.3324 3.73514 5.48822 3.58807C5.64403 3.44101 5.85188 3.36187 6.06605 3.36806C6.28022 3.37425 6.48315 3.46526 6.63022 3.62107L10.7652 8.00007L6.62922 12.3791C6.55378 12.459 6.4628 12.5227 6.36186 12.5663C6.26092 12.6098 6.15215 12.6323 6.04222 12.6323C5.93229 12.6323 5.82351 12.6098 5.72257 12.5663C5.62163 12.5227 5.53065 12.459 5.45522 12.3791Z"
      />
    </CustomSvgIcon>
  );
}
