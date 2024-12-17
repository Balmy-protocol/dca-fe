import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../../components/svgicon';
import { useTheme } from 'styled-components';

interface IconProps extends SvgIconProps {
  size?: string;
}

export function TierLevel1ActiveLight({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 14 18" style={size ? { fontSize: size } : {}} {...props}>
      <path
        d="M1.27515 2.34766C1.27515 1.51923 1.94672 0.847656 2.77515 0.847656H7.16335H11.5516C12.38 0.847656 13.0516 1.51923 13.0516 2.34766V14.2258C13.0516 14.699 12.8088 15.1391 12.4086 15.3916C9.20394 17.4132 5.12277 17.4132 1.91811 15.3916C1.51789 15.1391 1.27515 14.699 1.27515 14.2258V2.34766Z"
        fill="#E9E6FF"
        stroke="url(#paint0_linear_14115_6719)"
      />
      <g filter="url(#filter0_dddd_14115_6719)">
        <path
          d="M8.47063 5.00852V12.2812H6.93299V6.46804H6.89038L5.22489 7.51207V6.14844L7.02532 5.00852H8.47063Z"
          fill="url(#paint1_linear_14115_6719)"
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6719"
          x="0.702466"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6719" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6719" result="effect2_dropShadow_14115_6719" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6719" result="effect3_dropShadow_14115_6719" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6719" result="effect4_dropShadow_14115_6719" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6719" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_14115_6719"
          x1="3.95797"
          y1="9.81962"
          x2="11.8072"
          y2="9.81962"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#791AFF" />
          <stop offset="1" stopColor="#4A00B3" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_14115_6719"
          x1="5.7895"
          y1="8.28125"
          x2="9.15379"
          y2="8.28125"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#791AFF" />
          <stop offset="1" stopColor="#4A00B3" />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}

export function TierLevel1ActiveDark({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 13 18" style={size ? { fontSize: size } : {}} {...props}>
      <path
        d="M0.637939 2.34766C0.637939 1.51923 1.30951 0.847656 2.13794 0.847656H6.52615H10.9143C11.7428 0.847656 12.4144 1.51923 12.4144 2.34766V14.2258C12.4144 14.699 12.1716 15.1391 11.7714 15.3916C8.56673 17.4132 4.48556 17.4132 1.28091 15.3916C0.880679 15.1391 0.637939 14.699 0.637939 14.2258V2.34766Z"
        fill="#024A39"
        stroke="#07DFAA"
      />
      <g filter="url(#filter0_dddd_14115_6722)">
        <path
          d="M7.83343 5.00852V12.2812H6.29578V6.46804H6.25317L4.58769 7.51207V6.14844L6.38811 5.00852H7.83343Z"
          fill="white"
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

export default function TierLevel1Active({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();

  return mode === 'light' ? (
    <TierLevel1ActiveLight size={size} {...props} />
  ) : (
    <TierLevel1ActiveDark size={size} {...props} />
  );
}
