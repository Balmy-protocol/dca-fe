import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../../components/svgicon';
import { useTheme } from 'styled-components';

interface IconProps extends SvgIconProps {
  size?: string;
}

export function TierLevel1BigLight({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 59 73" style={size ? { fontSize: size } : {}} {...props}>
      <g filter="url(#filter0_dddd_14115_6711)">
        <path
          d="M0 4.64062C0 2.43149 1.79086 0.640625 4 0.640625H29.1626H54.3253C56.5344 0.640625 58.3253 2.43149 58.3253 4.64062V63.8499C58.3253 65.1784 57.611 66.4044 56.4553 67.0595C39.5257 76.6566 18.7996 76.6566 1.87002 67.0595C0.714263 66.4044 0 65.1784 0 63.8499V4.64062Z"
          fill="url(#paint0_linear_14115_6711)"
        />
        <path
          d="M0.904477 4.64062C0.904477 2.93102 2.29039 1.5451 4 1.5451H29.1626H54.3253C56.0349 1.5451 57.4208 2.93102 57.4208 4.64062V63.8499C57.4208 64.8527 56.8817 65.7781 56.0092 66.2727C39.3563 75.7129 18.969 75.7129 2.31606 66.2727C1.44364 65.7781 0.904477 64.8527 0.904477 63.8499V4.64062Z"
          stroke="url(#paint1_linear_14115_6711)"
          strokeWidth="1.80895"
        />
      </g>
      <rect x="7.4126" y="8.64062" width="43.5" height="52.4193" rx="4" fill="#F4F2F7" fillOpacity="0.4" />
      <rect
        x="7.66956"
        y="8.89758"
        width="42.9861"
        height="51.9054"
        rx="3.74304"
        stroke="#F9F7FD"
        strokeOpacity="0.5"
        strokeWidth="0.513915"
      />
      <g filter="url(#filter1_dddd_14115_6711)">
        <path
          d="M34.2685 20.9447V49.3502H28.2628V26.6453H28.0964L21.5914 30.723V25.397L28.6234 20.9447H34.2685Z"
          fill="url(#paint2_linear_14115_6711)"
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6711"
          x="-14.3896"
          y="-2.44286"
          width="87.1044"
          height="127.064"
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
          <feOffset dy="2.05566" />
          <feGaussianBlur stdDeviation="2.56957" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.08 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6711" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="9.25047" />
          <feGaussianBlur stdDeviation="4.62523" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.07 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6711" result="effect2_dropShadow_14115_6711" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="20.5566" />
          <feGaussianBlur stdDeviation="6.16698" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6711" result="effect3_dropShadow_14115_6711" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="35.974" />
          <feGaussianBlur stdDeviation="7.19481" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6711" result="effect4_dropShadow_14115_6711" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6711" result="shape" />
        </filter>
        <filter
          id="filter1_dddd_14115_6711"
          x="17.0689"
          y="20.0402"
          width="21.722"
          height="45.5906"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6711" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6711" result="effect2_dropShadow_14115_6711" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6711" result="effect3_dropShadow_14115_6711" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6711" result="effect4_dropShadow_14115_6711" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6711" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_14115_6711"
          x1="31.7557"
          y1="21.2186"
          x2="31.7557"
          y2="82.5312"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EADBFF" />
          <stop offset="1" stopColor="#BC8DFF" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_14115_6711"
          x1="28"
          y1="-66.1153"
          x2="5.94557"
          y2="-69.444"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#791AFF" />
          <stop offset="1" stopColor="#791AFF" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_14115_6711"
          x1="22.8908"
          y1="34.8502"
          x2="38.2491"
          y2="34.8502"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#791AFF" />
          <stop offset="1" stopColor="#4A00B3" />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}

export function TierLevel1BigDark({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 59 74" style={size ? { fontSize: size } : {}} {...props}>
      <g filter="url(#filter0_dddd_14115_6715)">
        <path
          d="M0 4C0 1.79086 1.79086 0 4 0H29.1626H54.3253C56.5344 0 58.3253 1.79086 58.3253 4V63.2092C58.3253 64.5378 57.611 65.7637 56.4553 66.4189C39.5257 76.016 18.7996 76.016 1.87002 66.4189C0.714263 65.7637 0 64.5378 0 63.2092V4Z"
          fill="url(#paint0_linear_14115_6715)"
        />
        <path
          d="M0.904477 4C0.904477 2.29039 2.29039 0.904477 4 0.904477H29.1626H54.3253C56.0349 0.904477 57.4208 2.29039 57.4208 4V63.2092C57.4208 64.2121 56.8817 65.1375 56.0092 65.6321C39.3563 75.0723 18.969 75.0723 2.31606 65.6321C1.44364 65.1375 0.904477 64.2121 0.904477 63.2092V4Z"
          stroke="#049571"
          strokeWidth="1.80895"
        />
      </g>
      <rect x="7.4126" y="8" width="43.5" height="52.4193" rx="4" fill="#F4F2F7" fillOpacity="0.4" />
      <rect
        x="7.66956"
        y="8.25696"
        width="42.9861"
        height="51.9054"
        rx="3.74304"
        stroke="#F9F7FD"
        strokeOpacity="0.5"
        strokeWidth="0.513915"
      />
      <g filter="url(#filter1_dddd_14115_6715)">
        <path
          d="M34.2685 20.3041V48.7096H28.2628V26.0046H28.0964L21.5914 30.0824V24.7563L28.6234 20.3041H34.2685Z"
          fill="url(#paint1_linear_14115_6715)"
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6715"
          x="-14.3896"
          y="-3.08349"
          width="87.1044"
          height="127.064"
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
          <feOffset dy="2.05566" />
          <feGaussianBlur stdDeviation="2.56957" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.08 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6715" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="9.25047" />
          <feGaussianBlur stdDeviation="4.62523" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.07 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6715" result="effect2_dropShadow_14115_6715" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="20.5566" />
          <feGaussianBlur stdDeviation="6.16698" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6715" result="effect3_dropShadow_14115_6715" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="35.974" />
          <feGaussianBlur stdDeviation="7.19481" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6715" result="effect4_dropShadow_14115_6715" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6715" result="shape" />
        </filter>
        <filter
          id="filter1_dddd_14115_6715"
          x="17.0689"
          y="19.3996"
          width="21.722"
          height="45.5906"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6715" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6715" result="effect2_dropShadow_14115_6715" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6715" result="effect3_dropShadow_14115_6715" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6715" result="effect4_dropShadow_14115_6715" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6715" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_14115_6715"
          x1="31.7557"
          y1="20.5779"
          x2="31.7557"
          y2="81.8906"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E6E6E6" />
          <stop offset="1" stopColor="#8DFFE3" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_14115_6715"
          x1="22.8908"
          y1="34.2096"
          x2="38.2491"
          y2="34.2096"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#049571" />
          <stop offset="1" stopColor="#024A39" />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}

export default function TierLevel1Big({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();

  return mode === 'light' ? (
    <TierLevel1BigLight size={size} {...props} />
  ) : (
    <TierLevel1BigDark size={size} {...props} />
  );
}
