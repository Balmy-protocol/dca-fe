import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../../components/svgicon';
import { useTheme } from 'styled-components';
import { colors } from '../../../theme';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function TierLevel0Flat({ size, ...props }: IconProps) {
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
        d="M0.5 2.47266C0.5 1.64423 1.17157 0.972656 2 0.972656H6.36279H10.7256C11.554 0.972656 12.2256 1.64423 12.2256 2.47266V15.0926C12.2256 15.921 11.554 16.5926 10.7256 16.5926H6.36279H2C1.17157 16.5926 0.5 15.921 0.5 15.0926V2.47266Z"
        stroke={colors[mode].typography.typo4}
      />
      <g filter="url(#filter0_dddd_14115_6708)">
        <path
          d="M6.3616 12.4411C5.7508 12.4387 5.22523 12.2884 4.78489 11.9901C4.34692 11.6918 4.00956 11.2597 3.77282 10.6939C3.53844 10.1281 3.42244 9.44744 3.42481 8.65199C3.42481 7.8589 3.54199 7.183 3.77637 6.62429C4.01311 6.06558 4.35047 5.64062 4.78844 5.34943C5.22878 5.05587 5.75317 4.90909 6.3616 4.90909C6.97002 4.90909 7.49323 5.05587 7.9312 5.34943C8.37154 5.64299 8.71008 6.06913 8.94682 6.62784C9.18357 7.18419 9.30075 7.8589 9.29839 8.65199C9.29839 9.44981 9.18001 10.1316 8.94327 10.6974C8.7089 11.2633 8.37272 11.6953 7.93475 11.9936C7.49678 12.2919 6.97239 12.4411 6.3616 12.4411ZM6.3616 11.1662C6.77826 11.1662 7.11089 10.9567 7.35947 10.5376C7.60805 10.1186 7.73115 9.49006 7.72878 8.65199C7.72878 8.10038 7.67197 7.6411 7.55833 7.27415C7.44706 6.9072 7.28844 6.63139 7.08248 6.44673C6.87888 6.26207 6.63858 6.16974 6.3616 6.16974C5.9473 6.16974 5.61586 6.37689 5.36728 6.79119C5.1187 7.20549 4.99322 7.82576 4.99086 8.65199C4.99086 9.2107 5.04649 9.67708 5.15776 10.0511C5.2714 10.4228 5.4312 10.7022 5.63716 10.8892C5.84313 11.0739 6.08461 11.1662 6.3616 11.1662Z"
          fill={colors[mode].typography.typo4}
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6708"
          x="-1.101"
          y="4.00458"
          width="14.9251"
          height="24.7171"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6708" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6708" result="effect2_dropShadow_14115_6708" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6708" result="effect3_dropShadow_14115_6708" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6708" result="effect4_dropShadow_14115_6708" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6708" result="shape" />
        </filter>
      </defs>
    </CustomSvgIcon>
  );
}
