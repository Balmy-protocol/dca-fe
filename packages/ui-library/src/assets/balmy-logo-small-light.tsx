import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';
import { baseColors } from '../theme';

interface IconProps extends SvgIconProps {
  size?: string;
}
export default function BalmyLogoSmallLight({ size, fill }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 54 65" style={{ fontSize: size, height: 'auto' }}>
      <g clipPath="url(#clip0_6221_22173)">
        <path
          d="M15.3341 22.4161H27.6342C29.8022 22.4161 31.9462 22.902 33.8899 23.8635C41.3659 27.5634 44.8714 35.5052 42.6409 43.4184C42.3475 44.4611 41.9286 45.4661 41.3978 46.4106C37.4923 53.3545 29.7606 56.4977 22.0933 54.2307C21.2119 53.9699 20.3604 53.6167 19.5532 53.1776C13.974 50.1398 10.7807 44.6595 10.7807 38.6874V36.801C7.12629 36.801 3.68132 35.4408 1.02344 32.9579V40.2759C1.02344 47.6042 6.22732 57.5619 14.5132 61.6469C26.2922 67.4538 38.0933 64.4492 45.4412 57.0961C50.1501 52.3853 53.0623 45.8765 53.0623 38.688C53.0623 31.4995 50.1501 24.9908 45.4412 20.2799C40.733 15.5685 34.2281 12.6543 27.0429 12.6543H15.3049L15.3341 22.4168V22.4161Z"
          fill={fill || baseColors.violet.violet100}
        />
        <path
          d="M10.7807 9.47538V32.2463C5.3921 32.2463 1.02344 27.877 1.02344 22.4877V-0.283203C3.71775 -0.283203 6.15707 0.808962 7.92249 2.57568C9.68856 4.3411 10.7807 6.78107 10.7807 9.47603V9.47538Z"
          fill={baseColors.violet.violet500}
        />
        <path
          d="M10.7807 9.43044V32.2469C5.3921 32.2469 1.02344 27.8685 1.02344 22.4688V-0.347656C3.71775 -0.347656 6.15707 0.747111 7.92249 2.51643C9.68856 4.28575 10.7807 6.73028 10.7807 9.43044Z"
          fill="#07F8BD"
        />
      </g>
      <defs>
        <clipPath id="clip0_6221_22173">
          <rect width="52.4477" height="64.5811" transform="translate(0.644531)" />
        </clipPath>
      </defs>
    </CustomSvgIcon>
  );
}
