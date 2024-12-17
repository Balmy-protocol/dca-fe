import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../../components/svgicon';
import { useTheme } from 'styled-components';

interface IconProps extends SvgIconProps {
  size?: string;
}

export function TierLevel0ActiveLight({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 14 18" style={size ? { fontSize: size } : {}} {...props}>
      <path
        d="M1.13721 2.47266C1.13721 1.64423 1.80878 0.972656 2.63721 0.972656H7H11.3628C12.1912 0.972656 12.8628 1.64423 12.8628 2.47266V15.0926C12.8628 15.921 12.1912 16.5926 11.3628 16.5926H7H2.63721C1.80878 16.5926 1.13721 15.921 1.13721 15.0926V2.47266Z"
        fill="#E9E6FF"
        stroke="url(#paint0_linear_14115_6705)"
      />
      <g filter="url(#filter0_dddd_14115_6705)">
        <path
          d="M6.99831 12.4411C6.38752 12.4387 5.86195 12.2884 5.42161 11.9901C4.98364 11.6918 4.64628 11.2597 4.40954 10.6939C4.17516 10.1281 4.05916 9.44744 4.06152 8.65199C4.06152 7.8589 4.17871 7.183 4.41309 6.62429C4.64983 6.06558 4.98719 5.64062 5.42516 5.34943C5.8655 5.05587 6.38989 4.90909 6.99831 4.90909C7.60674 4.90909 8.12994 5.05587 8.56792 5.34943C9.00826 5.64299 9.3468 6.06913 9.58354 6.62784C9.82028 7.18419 9.93747 7.8589 9.9351 8.65199C9.9351 9.44981 9.81673 10.1316 9.57999 10.6974C9.34562 11.2633 9.00944 11.6953 8.57147 11.9936C8.13349 12.2919 7.60911 12.4411 6.99831 12.4411ZM6.99831 11.1662C7.41498 11.1662 7.7476 10.9567 7.99618 10.5376C8.24476 10.1186 8.36787 9.49006 8.3655 8.65199C8.3655 8.10038 8.30868 7.6411 8.19505 7.27415C8.08378 6.9072 7.92516 6.63139 7.7192 6.44673C7.5156 6.26207 7.2753 6.16974 6.99831 6.16974C6.58402 6.16974 6.25258 6.37689 6.004 6.79119C5.75542 7.20549 5.62994 7.82576 5.62758 8.65199C5.62758 9.2107 5.68321 9.67708 5.79448 10.0511C5.90812 10.4228 6.06792 10.7022 6.27388 10.8892C6.47985 11.0739 6.72133 11.1662 6.99831 11.1662Z"
          fill="url(#paint1_linear_14115_6705)"
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6705"
          x="-0.464282"
          y="4.00458"
          width="14.9254"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6705" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6705" result="effect2_dropShadow_14115_6705" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6705" result="effect3_dropShadow_14115_6705" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6705" result="effect4_dropShadow_14115_6705" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6705" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_14115_6705"
          x1="3.80737"
          y1="8.78261"
          x2="11.6254"
          y2="8.78261"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#791AFF" />
          <stop offset="1" stopColor="#4A00B3" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_14115_6705"
          x1="5.63124"
          y1="8.28125"
          x2="8.98215"
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

export function TierLevel0ActiveDark({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 13 18" style={size ? { fontSize: size } : {}} {...props}>
      <path
        d="M0.5 2.47266C0.5 1.64423 1.17157 0.972656 2 0.972656H6.36279H10.7256C11.554 0.972656 12.2256 1.64423 12.2256 2.47266V15.0926C12.2256 15.921 11.554 16.5926 10.7256 16.5926H6.36279H2C1.17157 16.5926 0.5 15.921 0.5 15.0926V2.47266Z"
        fill="#024A39"
        stroke="#07DFAA"
      />
      <g filter="url(#filter0_dddd_14115_6708)">
        <path
          d="M6.3616 12.4411C5.7508 12.4387 5.22523 12.2884 4.78489 11.9901C4.34692 11.6918 4.00956 11.2597 3.77282 10.6939C3.53844 10.1281 3.42244 9.44744 3.42481 8.65199C3.42481 7.8589 3.54199 7.183 3.77637 6.62429C4.01311 6.06558 4.35047 5.64062 4.78844 5.34943C5.22878 5.05587 5.75317 4.90909 6.3616 4.90909C6.97002 4.90909 7.49323 5.05587 7.9312 5.34943C8.37154 5.64299 8.71008 6.06913 8.94682 6.62784C9.18357 7.18419 9.30075 7.8589 9.29839 8.65199C9.29839 9.44981 9.18001 10.1316 8.94327 10.6974C8.7089 11.2633 8.37272 11.6953 7.93475 11.9936C7.49678 12.2919 6.97239 12.4411 6.3616 12.4411ZM6.3616 11.1662C6.77826 11.1662 7.11089 10.9567 7.35947 10.5376C7.60805 10.1186 7.73115 9.49006 7.72878 8.65199C7.72878 8.10038 7.67197 7.6411 7.55833 7.27415C7.44706 6.9072 7.28844 6.63139 7.08248 6.44673C6.87888 6.26207 6.63858 6.16974 6.3616 6.16974C5.9473 6.16974 5.61586 6.37689 5.36728 6.79119C5.1187 7.20549 4.99322 7.82576 4.99086 8.65199C4.99086 9.2107 5.04649 9.67708 5.15776 10.0511C5.2714 10.4228 5.4312 10.7022 5.63716 10.8892C5.84313 11.0739 6.08461 11.1662 6.3616 11.1662Z"
          fill="white"
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

export default function TierLevel0Active({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();

  return mode === 'light' ? (
    <TierLevel0ActiveLight size={size} {...props} />
  ) : (
    <TierLevel0ActiveDark size={size} {...props} />
  );
}
