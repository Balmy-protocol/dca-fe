import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';
import { baseColors } from '../theme';

interface IconProps extends SvgIconProps {
  size?: string;
}
export default function BalmyLogoSmallDark({ size, fill }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 54 65" style={{ fontSize: size, height: 'auto' }}>
      <g clipPath="url(#clip0_6221_9228)">
        <path
          d="M15.3302 22.4161H27.6302C29.7983 22.4161 31.9423 22.902 33.886 23.8635C41.362 27.5634 44.8675 35.5052 42.637 43.4184C42.3436 44.4611 41.9247 45.4661 41.3939 46.4106C37.4884 53.3545 29.7567 56.4977 22.0894 54.2307C21.208 53.9699 20.3565 53.6167 19.5493 53.1776C13.97 50.1398 10.7768 44.6595 10.7768 38.6874V36.801C7.12239 36.801 3.67742 35.4408 1.01953 32.9579V40.2759C1.01953 47.6042 6.22342 57.5619 14.5093 61.6469C26.2883 67.4538 38.0894 64.4492 45.4373 57.0961C50.1462 52.3853 53.0584 45.8765 53.0584 38.688C53.0584 31.4995 50.1462 24.9908 45.4373 20.2799C40.7291 15.5685 34.2242 12.6543 27.039 12.6543H15.3009L15.3302 22.4168V22.4161Z"
          fill={fill || baseColors.violet.violet800}
        />
        <path
          d="M10.7768 9.47538V32.2463C5.38819 32.2463 1.01953 27.877 1.01953 22.4877V-0.283203C3.71384 -0.283203 6.15316 0.808962 7.91858 2.57568C9.68465 4.3411 10.7768 6.78107 10.7768 9.47603V9.47538Z"
          fill={baseColors.violet.violet500}
        />
        <path
          d="M10.7768 9.43044V32.2469C5.38819 32.2469 1.01953 27.8685 1.01953 22.4688V-0.347656C3.71384 -0.347656 6.15316 0.747111 7.91858 2.51643C9.68465 4.28575 10.7768 6.73028 10.7768 9.43044Z"
          fill={baseColors.violet.violet500}
        />
      </g>
      <defs>
        <clipPath id="clip0_6221_9228">
          <rect width="52.4477" height="64.5811" transform="translate(0.642578)" />
        </clipPath>
      </defs>
    </CustomSvgIcon>
  );
}
