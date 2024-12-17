import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../../components/svgicon';
import { useTheme } from 'styled-components';

interface IconProps extends SvgIconProps {
  size?: string;
}

export function TierLevel4ActiveLight({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 13 18" style={size ? { fontSize: size } : {}} {...props}>
      <path
        d="M10.6335 16.2826L10.98 16.643L10.6335 16.2826L10.2497 16.6514C10.0103 16.8816 9.67209 16.9779 9.34728 16.9083L8.17869 16.6579L7.10232 16.3664C6.67429 16.2504 6.22312 16.2504 5.79509 16.3664L4.71722 16.6583L3.64926 16.8941C3.34656 16.9609 3.02998 16.8835 2.79218 16.6847L2.22341 16.209L1.90264 16.5925L2.22341 16.209C1.97388 16.0003 1.67998 15.8514 1.36413 15.7735C0.856654 15.6485 0.5 15.1933 0.5 14.6707V3.81149C0.5 3.1869 0.887035 2.62767 1.47159 2.40765L5.92029 0.733143C6.2609 0.604936 6.63651 0.604936 6.97712 0.733142L11.4258 2.40765C12.0104 2.62767 12.3974 3.1869 12.3974 3.81149V14.7154C12.3974 15.2118 12.0587 15.6441 11.5767 15.7628C11.2221 15.8502 10.8968 16.0295 10.6335 16.2826Z"
        fill="#362550"
        stroke="url(#paint0_linear_14115_6733)"
      />
      <g filter="url(#filter0_dddd_14115_6733)">
        <path
          d="M3.53931 11.6552V10.4442L6.57553 5.66087H7.61957V7.337H7.00167L5.08761 10.3661V10.4229H9.40224V11.6552H3.53931ZM7.03008 12.9336V11.2859L7.05849 10.7496V5.66087H8.50025V12.9336H7.03008Z"
          fill="#FEFEFF"
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6733"
          x="-0.98308"
          y="4.75641"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6733" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6733" result="effect2_dropShadow_14115_6733" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6733" result="effect3_dropShadow_14115_6733" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6733" result="effect4_dropShadow_14115_6733" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6733" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_14115_6733"
          x1="3.21297"
          y1="8.78206"
          x2="11.1365"
          y2="8.78206"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#791AFF" />
          <stop offset="1" stopColor="#4A00B3" />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}

export function TierLevel4ActiveDark({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 14 18" style={size ? { fontSize: size } : {}} {...props}>
      <path
        d="M0.862793 3.73612C0.862793 3.10444 1.25853 2.54045 1.85254 2.32557L6.30124 0.716289C6.63096 0.597018 6.99204 0.597018 7.32175 0.716289L11.7705 2.32557C12.3645 2.54045 12.7602 3.10444 12.7602 3.73612V14.0871C12.7602 14.5844 12.4184 15.0166 11.9345 15.1311C11.5875 15.2133 11.2675 15.3836 11.0055 15.6256L10.6111 15.99C10.3743 16.2088 10.0466 16.2999 9.73086 16.2349L8.53714 15.9892L7.4413 15.7039C7.02831 15.5964 6.59468 15.5964 6.18169 15.7039L5.08441 15.9895L3.9923 16.2212C3.69855 16.2835 3.39235 16.2105 3.1583 16.0224L2.5752 15.5538C2.32827 15.3553 2.04016 15.2144 1.73188 15.1414C1.22251 15.0208 0.862793 14.566 0.862793 14.0425V3.73612Z"
        fill="#011913"
        stroke="#07DFAA"
      />
      <g filter="url(#filter0_dddd_14115_6736)">
        <path
          d="M3.9021 10.6552V9.44425L6.93832 4.66087H7.98236V6.337H7.36446L5.4504 9.36612V9.42294H9.76503V10.6552H3.9021ZM7.39287 11.9336V10.2859L7.42128 9.74964V4.66087H8.86304V11.9336H7.39287Z"
          fill="#FEFEFF"
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

export default function TierLevel4Active({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();

  return mode === 'light' ? (
    <TierLevel4ActiveLight size={size} {...props} />
  ) : (
    <TierLevel4ActiveDark size={size} {...props} />
  );
}
