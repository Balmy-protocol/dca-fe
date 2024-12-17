import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../../components/svgicon';
import { useTheme } from 'styled-components';
import { colors } from '../../../theme';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function TierLevel2Flat({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <CustomSvgIcon viewBox="0 0 14 18" style={size ? { fontSize: size } : {}} {...props} sx={{ fill: 'transparent' }}>
      <path
        d="M0.996094 3.29546C0.996094 2.65014 1.40882 2.07715 2.0209 1.87271L2.88002 1.58577C5.48089 0.717088 8.29362 0.717088 10.8945 1.58577L11.7536 1.87271C12.3657 2.07715 12.7784 2.65014 12.7784 3.29546V14.3482C12.7784 15.0016 12.3554 15.5799 11.7327 15.7777L10.7182 16.1001C8.22565 16.8922 5.54887 16.8922 3.05632 16.1001L2.04181 15.7777C1.41908 15.5799 0.996094 15.0016 0.996094 14.3482V3.29546Z"
        stroke={colors[mode].typography.typo4}
      />
      <g filter="url(#filter0_dddd_14115_6680)">
        <path
          d="M4.32747 12.2812V11.1733L6.91625 8.77628C7.13642 8.56321 7.32108 8.37145 7.47023 8.20099C7.62174 8.03054 7.73656 7.86364 7.81469 7.70028C7.89281 7.53456 7.93188 7.35582 7.93188 7.16406C7.93188 6.95099 7.88334 6.76752 7.78628 6.61364C7.68921 6.45739 7.55664 6.33783 7.38855 6.25497C7.22046 6.16974 7.02989 6.12713 6.81682 6.12713C6.59428 6.12713 6.40015 6.17211 6.23443 6.26207C6.06871 6.35204 5.94087 6.48106 5.85091 6.64915C5.76095 6.81723 5.71597 7.01728 5.71597 7.24929H4.25645C4.25645 6.77344 4.36417 6.36032 4.5796 6.00994C4.79504 5.65956 5.09688 5.38849 5.48514 5.19673C5.8734 5.00497 6.32084 4.90909 6.82747 4.90909C7.34831 4.90909 7.80167 5.00142 8.18756 5.18608C8.57581 5.36837 8.87766 5.62169 9.0931 5.94602C9.30853 6.27036 9.41625 6.64205 9.41625 7.06108C9.41625 7.3357 9.3618 7.60677 9.2529 7.87429C9.14636 8.14181 8.95579 8.43892 8.68117 8.76562C8.40654 9.08996 8.01947 9.4794 7.51994 9.93395L6.45815 10.9744V11.0241H9.51213V12.2812H4.32747Z"
          fill={colors[mode].typography.typo4}
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6680"
          x="-0.266039"
          y="4.00458"
          width="14.3006"
          height="24.5573"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6680" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6680" result="effect2_dropShadow_14115_6680" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6680" result="effect3_dropShadow_14115_6680" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6680" result="effect4_dropShadow_14115_6680" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6680" result="shape" />
        </filter>
      </defs>
    </CustomSvgIcon>
  );
}
