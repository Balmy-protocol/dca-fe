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
    <CustomSvgIcon
      viewBox="0 0 17 17.5619"
      style={size ? { fontSize: size } : {}}
      {...props}
      sx={{ fill: 'transparent' }}
    >
      <path
        d="M1.6333 2.26987C1.6333 2.23622 1.65482 2.20635 1.68673 2.19569L3.51722 1.58431C6.1181 0.715623 8.93083 0.715623 11.5317 1.58431L13.3622 2.19569C13.3941 2.20635 13.4156 2.23622 13.4156 2.26987V15.3868C13.4156 15.4208 13.3936 15.451 13.3611 15.4613L11.3554 16.0987C8.86286 16.8908 6.18607 16.8908 3.69353 16.0987L1.68782 15.4613C1.65535 15.451 1.6333 15.4208 1.6333 15.3868V2.26987Z"
        stroke={colors[mode].typography.typo4}
      />
      <g filter="url(#filter0_dddd_2750_122203)">
        <path
          d="M4.96468 12.2812V11.1733L7.55346 8.77628C7.77363 8.56321 7.95829 8.37145 8.10743 8.20099C8.25895 8.03054 8.37377 7.86364 8.45189 7.70028C8.53002 7.53456 8.56908 7.35582 8.56908 7.16406C8.56908 6.95099 8.52055 6.76752 8.42349 6.61364C8.32642 6.45739 8.19385 6.33783 8.02576 6.25497C7.85767 6.16974 7.66709 6.12713 7.45403 6.12713C7.23149 6.12713 7.03736 6.17211 6.87164 6.26207C6.70592 6.35204 6.57808 6.48106 6.48812 6.64915C6.39815 6.81723 6.35317 7.01728 6.35317 7.24929H4.89366C4.89366 6.77344 5.00137 6.36032 5.21681 6.00994C5.43225 5.65956 5.73409 5.38849 6.12235 5.19673C6.51061 5.00497 6.95805 4.90909 7.46468 4.90909C7.98551 4.90909 8.43887 5.00142 8.82476 5.18608C9.21302 5.36837 9.51487 5.62169 9.7303 5.94602C9.94574 6.27036 10.0535 6.64205 10.0535 7.06108C10.0535 7.3357 9.99901 7.60677 9.89011 7.87429C9.78357 8.14181 9.59299 8.43892 9.31837 8.76562C9.04375 9.08996 8.65668 9.4794 8.15715 9.93395L7.09536 10.9744V11.0241H10.1493V12.2812H4.96468Z"
          fill={colors[mode].typography.typo4}
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_2750_122203"
          x="0.371168"
          y="4.00568"
          width="14.3006"
          height="24.5562"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2750_122203" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_2750_122203" result="effect2_dropShadow_2750_122203" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_2750_122203" result="effect3_dropShadow_2750_122203" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_2750_122203" result="effect4_dropShadow_2750_122203" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_2750_122203" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_2750_122203"
          x1="7.52447"
          y1="-0.28125"
          x2="7.52447"
          y2="17.8407"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#CCA509" />
          <stop offset="1" stopColor="#665305" />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}
