import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function ChevronRightSmallIcon({ size, color, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 16 17" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.45473 12.5319C5.31331 12.3822 5.23453 12.1839 5.23453 11.9779C5.23453 11.7719 5.31331 11.5737 5.45473 11.4239L8.53573 8.15294L5.45473 4.88294C5.30767 4.72713 5.22852 4.51928 5.23471 4.30511C5.2409 4.09094 5.33191 3.88801 5.48773 3.74094C5.64354 3.59388 5.8514 3.51474 6.06556 3.52093C6.27973 3.52712 6.48267 3.61813 6.62973 3.77394L10.7647 8.15294L6.62873 12.5319C6.55329 12.6119 6.46231 12.6756 6.36137 12.7192C6.26043 12.7627 6.15166 12.7852 6.04173 12.7852C5.9318 12.7852 5.82303 12.7627 5.72209 12.7192C5.62115 12.6756 5.53017 12.6119 5.45473 12.5319Z"
      />
    </CustomSvgIcon>
  );
}
