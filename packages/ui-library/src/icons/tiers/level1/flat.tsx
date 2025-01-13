import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../../components/svgicon';
import { colors } from '../../../theme';
import { useTheme } from 'styled-components';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function TierLevel1Flat({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();

  return (
    <CustomSvgIcon
      viewBox="0 0 13 18"
      style={size ? { fontSize: size } : {}}
      {...props}
      sx={{ fill: 'transparent !important' }}
    >
      <path
        d="M0.637939 2.34766C0.637939 1.51923 1.30951 0.847656 2.13794 0.847656H6.52615H10.9143C11.7428 0.847656 12.4144 1.51923 12.4144 2.34766V14.2258C12.4144 14.699 12.1716 15.1391 11.7714 15.3916C8.56673 17.4132 4.48556 17.4132 1.28091 15.3916C0.880679 15.1391 0.637939 14.699 0.637939 14.2258V2.34766Z"
        stroke={colors[mode].typography.typo4}
      />
      <g filter="url(#filter0_dddd_14115_6722)">
        <path
          d="M7.83343 5.00852V12.2812H6.29578V6.46804H6.25317L4.58769 7.51207V6.14844L6.38811 5.00852H7.83343Z"
          fill={colors[mode].typography.typo4}
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6722"
          x="0.0652595"
          y="4.10407"
          width="12.2906"
          height="24.4578"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6722" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6722" result="effect2_dropShadow_14115_6722" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6722" result="effect3_dropShadow_14115_6722" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6722" result="effect4_dropShadow_14115_6722" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6722" result="shape" />
        </filter>
      </defs>
    </CustomSvgIcon>
  );
}
