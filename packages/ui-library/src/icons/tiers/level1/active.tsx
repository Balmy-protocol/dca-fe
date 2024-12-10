import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function TierLevel1Active({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 14 17.5415" style={size ? { fontSize: size } : {}} {...props}>
      <path
        d="M1.27515 0.932133C1.27515 0.885478 1.31297 0.847656 1.35962 0.847656H7.16335H12.9671C13.0137 0.847656 13.0516 0.885478 13.0516 0.932133V14.9394C13.0516 14.9684 13.0367 14.9954 13.0122 15.0109L12.7655 15.1665C9.34278 17.3256 4.98393 17.3256 1.56123 15.1665L1.31455 15.0109L1.04778 15.4337L1.31455 15.0109C1.29002 14.9954 1.27515 14.9684 1.27515 14.9394V0.932133Z"
        fill="#DDD6D3"
        stroke="#978BA9"
      />
      <g filter="url(#filter0_dddd_2750_122198)">
        <path
          d="M8.47063 5.00852V12.2812H6.93299V6.46804H6.89038L5.22489 7.51207V6.14844L7.02532 5.00852H8.47063Z"
          fill="#695A7D"
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_2750_122198"
          x="0.702466"
          y="4.10334"
          width="12.2906"
          height="24.4585"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="0.904477" />
          <feGaussianBlur stdDeviation="0.904477" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.05 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2750_122198" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_2750_122198" result="effect2_dropShadow_2750_122198" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_2750_122198" result="effect3_dropShadow_2750_122198" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_2750_122198" result="effect4_dropShadow_2750_122198" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_2750_122198" result="shape" />
        </filter>
      </defs>
    </CustomSvgIcon>
  );
}
