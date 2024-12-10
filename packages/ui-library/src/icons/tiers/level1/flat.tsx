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
      viewBox="0 0 14 17.5415"
      style={size ? { fontSize: size } : {}}
      {...props}
      sx={{ fill: 'transparent !important' }}
    >
      <path
        d="M1.12292 0.644347C1.12292 0.601301 1.15782 0.566406 1.20087 0.566406H7.01113H12.8214C12.8644 0.566406 12.8993 0.601302 12.8993 0.644347V14.7009C12.8993 14.7033 12.8981 14.7055 12.8961 14.7068C9.30058 16.9749 4.72168 16.9749 1.12619 14.7068C1.12416 14.7055 1.12292 14.7033 1.12292 14.7009V0.644347Z"
        stroke={colors[mode].typography.typo4}
      />
      <g filter="url(#filter0_dddd_2709_144812)">
        <path
          d="M8.31841 4.72727V12H6.78077V6.18679H6.73816L5.07267 7.23082V5.86719L6.8731 4.72727H8.31841Z"
          fill={colors[mode].typography.typo4}
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_2709_144812"
          x="4.08198"
          y="4.52843"
          width="5.22702"
          height="11.0379"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFixFlat1" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="0.19813" />
          <feGaussianBlur stdDeviation="0.19813" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.05 0" />
          <feBlend mode="normal" in2="BackgroundImageFixFlat1" result="effect1_dropShadow_2709_144812" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="0.594389" />
          <feGaussianBlur stdDeviation="0.297195" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_2709_144812" result="effect2_dropShadow_2709_144812" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1.38691" />
          <feGaussianBlur stdDeviation="0.396259" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_2709_144812" result="effect3_dropShadow_2709_144812" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.57569" />
          <feGaussianBlur stdDeviation="0.495324" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_2709_144812" result="effect4_dropShadow_2709_144812" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_2709_144812" result="shape" />
        </filter>
      </defs>
    </CustomSvgIcon>
  );
}
