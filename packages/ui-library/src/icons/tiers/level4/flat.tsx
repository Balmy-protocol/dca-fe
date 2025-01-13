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
    <CustomSvgIcon viewBox="0 0 14 18" style={size ? { fontSize: size } : {}} {...props} sx={{ fill: 'transparent' }}>
      <path
        d="M0.862793 3.73612C0.862793 3.10444 1.25853 2.54045 1.85254 2.32557L6.30124 0.716289C6.63096 0.597018 6.99204 0.597018 7.32175 0.716289L11.7705 2.32557C12.3645 2.54045 12.7602 3.10444 12.7602 3.73612V14.0871C12.7602 14.5844 12.4184 15.0166 11.9345 15.1311C11.5875 15.2133 11.2675 15.3836 11.0055 15.6256L10.6111 15.99C10.3743 16.2088 10.0466 16.2999 9.73086 16.2349L8.53714 15.9892L7.4413 15.7039C7.02831 15.5964 6.59468 15.5964 6.18169 15.7039L5.08441 15.9895L3.9923 16.2212C3.69855 16.2835 3.39235 16.2105 3.1583 16.0224L2.5752 15.5538C2.32827 15.3553 2.04016 15.2144 1.73188 15.1414C1.22251 15.0208 0.862793 14.566 0.862793 14.0425V3.73612Z"
        stroke={colors[mode].typography.typo4}
      />
      <g filter="url(#filter0_dddd_14115_6736)">
        <path
          d="M3.9021 10.6552V9.44425L6.93832 4.66087H7.98236V6.337H7.36446L5.4504 9.36612V9.42294H9.76503V10.6552H3.9021ZM7.39287 11.9336V10.2859L7.42128 9.74964V4.66087H8.86304V11.9336H7.39287Z"
          fill={colors[mode].typography.typo4}
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6736"
          x="-0.620287"
          y="3.75641"
          width="14.9078"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6736" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6736" result="effect2_dropShadow_14115_6736" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6736" result="effect3_dropShadow_14115_6736" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6736" result="effect4_dropShadow_14115_6736" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6736" result="shape" />
        </filter>
      </defs>
    </CustomSvgIcon>
  );
}
