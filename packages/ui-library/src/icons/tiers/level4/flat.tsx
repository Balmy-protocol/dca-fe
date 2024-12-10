import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../../components/svgicon';
import { useTheme } from 'styled-components';
import { colors } from '../../../theme';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function TierLevel4Flat({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();

  return (
    <CustomSvgIcon
      viewBox="0 0 15 17.5619"
      style={size ? { fontSize: size } : {}}
      {...props}
      sx={{ fill: 'transparent' }}
    >
      <path
        d="M1.62337 2.44477L1.49379 1.96186L1.62337 2.44477L2.66007 2.1666C2.83359 2.12003 2.99283 2.03109 3.12348 1.90775L4.16246 0.92689C4.18308 0.907427 4.21208 0.899604 4.23969 0.906061L5.64058 1.2337C5.81461 1.2744 5.996 1.27146 6.16861 1.22514L7.4876 0.871218C7.50194 0.86737 7.51705 0.86737 7.53139 0.871219L8.85378 1.22606C9.02237 1.2713 9.1994 1.27517 9.36982 1.23734L10.8627 0.905999C10.8911 0.899686 10.9208 0.908476 10.9412 0.929258L11.2968 0.579857L10.9412 0.929258L11.8778 1.88233C12.0134 2.0203 12.1834 2.1195 12.3702 2.16963L13.3956 2.44477C13.4325 2.45468 13.4582 2.48814 13.4582 2.52636V15.1452C13.4582 15.1841 13.4317 15.2179 13.3939 15.2272L12.3786 15.4774C12.1936 15.5229 12.0239 15.6165 11.8865 15.7485L10.9599 16.6392C10.9397 16.6586 10.9111 16.6668 10.8836 16.6609L9.358 16.334C9.19733 16.2996 9.03094 16.3022 8.87139 16.3415L8.98763 16.8133L8.87139 16.3415L7.5297 16.672C7.51643 16.6753 7.50256 16.6753 7.48928 16.672L6.14946 16.3419C5.9877 16.3021 5.81894 16.3 5.65627 16.3359L5.76404 16.8242L5.65627 16.3359L4.2706 16.6418C4.24503 16.6474 4.21828 16.6409 4.19819 16.6241L3.09751 15.7036C2.97082 15.5976 2.82159 15.522 2.66122 15.4825L2.54582 15.9509L2.66122 15.4825L1.62506 15.2272C1.58732 15.2179 1.56079 15.1841 1.56079 15.1452V2.52636C1.56079 2.48814 1.58646 2.45468 1.62337 2.44477Z"
        stroke={colors[mode].typography.typo4}
      />
      <g filter="url(#filter0_dddd_2750_122202)">
        <path
          d="M4.6001 11.0028V9.7919L7.63632 5.00852H8.68036V6.68466H8.06246L6.1484 9.71378V9.7706H10.463V11.0028H4.6001ZM8.09087 12.2812V10.6335L8.11928 10.0973V5.00852H9.56104V12.2812H8.09087Z"
          fill={colors[mode].typography.typo4}
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_2750_122202"
          x="0.0777106"
          y="4.10334"
          width="14.9078"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2750_122202" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_2750_122202" result="effect2_dropShadow_2750_122202" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_2750_122202" result="effect3_dropShadow_2750_122202" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_2750_122202" result="effect4_dropShadow_2750_122202" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_2750_122202" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_2750_122202"
          x1="4.27376"
          y1="8.78125"
          x2="12.1973"
          y2="8.78125"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#791AFF" />
          <stop offset="1" stopColor="#4A00B3" />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}
