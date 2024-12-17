import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../../components/svgicon';
import { useTheme } from 'styled-components';

interface IconProps extends SvgIconProps {
  size?: string;
}

export function TierLevel2BigLight({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 59 77" style={size ? { fontSize: size } : {}} {...props}>
      <g filter="url(#filter0_dddd_14115_6669)">
        <path
          d="M0.000732422 10.7255C0.000732422 9.04694 1.04878 7.54691 2.62496 6.96957L8.52675 4.8078C21.8516 -0.0729859 36.4751 -0.0729887 49.8 4.80779L55.7018 6.96957C57.278 7.54691 58.326 9.04694 58.326 10.7255V66.51C58.326 68.2001 57.2638 69.7078 55.6723 70.2766L49.3569 72.5338C36.299 77.2008 22.0277 77.2008 8.9699 72.5338L2.6545 70.2766C1.06299 69.7078 0.000732422 68.2001 0.000732422 66.51V10.7255Z"
          fill="url(#paint0_linear_14115_6669)"
        />
        <path
          d="M0.90521 10.7255C0.90521 9.4265 1.71627 8.26566 2.93605 7.81886L8.83784 5.65709C21.9618 0.849885 36.3649 0.849883 49.4889 5.65709L55.3907 7.81886C56.6105 8.26566 57.4216 9.4265 57.4216 10.7255V66.51C57.4216 67.8179 56.5995 68.9847 55.3679 69.4249L49.0525 71.6821C36.1915 76.2787 22.1353 76.2787 9.27431 71.6821L2.95891 69.4249C1.72727 68.9847 0.90521 67.8179 0.90521 66.51V10.7255Z"
          stroke="url(#paint1_linear_14115_6669)"
          strokeWidth="1.80895"
        />
      </g>
      <rect x="7.67004" y="12.546" width="42.987" height="51.9054" rx="3.74304" fill="#F4F2F7" fillOpacity="0.4" />
      <rect
        x="7.67004"
        y="12.546"
        width="42.987"
        height="51.9054"
        rx="3.74304"
        stroke="#F4F3F5"
        strokeWidth="0.513915"
      />
      <g filter="url(#filter1_dddd_14115_6669)">
        <path
          d="M19.1651 52.9987V48.6713L29.2763 39.3091C30.1362 38.4769 30.8574 37.7279 31.44 37.0622C32.0317 36.3964 32.4802 35.7446 32.7853 35.1065C33.0905 34.4593 33.243 33.7612 33.243 33.0122C33.243 32.18 33.0535 31.4634 32.6744 30.8624C32.2953 30.2521 31.7775 29.7851 31.121 29.4615C30.4645 29.1286 29.7201 28.9622 28.8879 28.9622C28.0187 28.9622 27.2605 29.1379 26.6133 29.4892C25.966 29.8406 25.4667 30.3446 25.1153 31.0011C24.7639 31.6576 24.5883 32.4389 24.5883 33.3451H18.8877C18.8877 31.4865 19.3085 29.873 20.1499 28.5045C20.9913 27.136 22.1703 26.0773 23.6867 25.3283C25.2032 24.5793 26.9508 24.2048 28.9295 24.2048C30.9638 24.2048 32.7345 24.5654 34.2417 25.2867C35.7581 25.9987 36.9371 26.988 37.7785 28.2548C38.6199 29.5216 39.0406 30.9733 39.0406 32.61C39.0406 33.6826 38.828 34.7413 38.4026 35.7862C37.9865 36.831 37.2422 37.9915 36.1696 39.2675C35.097 40.5343 33.5852 42.0553 31.6341 43.8307L27.4871 47.8945V48.0887H39.4151V52.9987H19.1651Z"
          fill="url(#paint2_linear_14115_6669)"
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6669"
          x="-14.3889"
          y="-1.93627"
          width="87.1044"
          height="128.334"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6669" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="9.25047" />
          <feGaussianBlur stdDeviation="4.62523" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.07 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6669" result="effect2_dropShadow_14115_6669" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="20.5566" />
          <feGaussianBlur stdDeviation="6.16698" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6669" result="effect3_dropShadow_14115_6669" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="35.974" />
          <feGaussianBlur stdDeviation="7.19481" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6669" result="effect4_dropShadow_14115_6669" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6669" result="shape" />
        </filter>
        <filter
          id="filter1_dddd_14115_6669"
          x="14.3653"
          y="23.3004"
          width="29.5721"
          height="45.9789"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6669" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6669" result="effect2_dropShadow_14115_6669" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6669" result="effect3_dropShadow_14115_6669" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6669" result="effect4_dropShadow_14115_6669" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6669" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_14115_6669"
          x1="31.7564"
          y1="17.9804"
          x2="31.7564"
          y2="79.7511"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EADBFF" />
          <stop offset="1" stopColor="#A768FF" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_14115_6669"
          x1="28.0007"
          y1="-3.19968"
          x2="5.92033"
          y2="-6.44303"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#791AFF" />
          <stop offset="1" stopColor="#791AFF" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_14115_6669"
          x1="22.8915"
          y1="38.4987"
          x2="38.2503"
          y2="38.4987"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#791AFF" />
          <stop offset="1" stopColor="#4A00B3" />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}

export function TierLevel2BigDark({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 59 83" style={size ? { fontSize: size } : {}} {...props}>
      <g filter="url(#filter0_dddd_14115_6673)">
        <path
          d="M0.000732422 13.7267C0.000732422 12.0482 1.04878 10.5481 2.62496 9.97079L8.52675 7.80902C21.8516 2.92823 36.4751 2.92823 49.8 7.80901L55.7018 9.97079C57.278 10.5481 58.326 12.0482 58.326 13.7267V69.5112C58.326 71.2013 57.2638 72.709 55.6723 73.2778L49.3569 75.535C36.299 80.202 22.0277 80.202 8.9699 75.535L2.6545 73.2778C1.06299 72.709 0.000732422 71.2013 0.000732422 69.5112V13.7267Z"
          fill="url(#paint0_linear_14115_6673)"
        />
        <path
          d="M0.90521 13.7267C0.90521 12.4277 1.71627 11.2669 2.93605 10.8201L8.83784 8.65831C21.9618 3.85111 36.3649 3.8511 49.4889 8.65831L55.3907 10.8201C56.6105 11.2669 57.4216 12.4277 57.4216 13.7267V69.5112C57.4216 70.8191 56.5995 71.9859 55.3679 72.4261L49.0525 74.6833C36.1915 79.2799 22.1353 79.2799 9.27431 74.6833L2.95891 72.4261C1.72727 71.9859 0.90521 70.8191 0.90521 69.5112V13.7267Z"
          stroke="#049571"
          strokeWidth="1.80895"
        />
      </g>
      <rect x="7.67004" y="14.796" width="42.987" height="51.9054" rx="3.74304" fill="#F4F2F7" fillOpacity="0.4" />
      <rect
        x="7.67004"
        y="14.796"
        width="42.987"
        height="51.9054"
        rx="3.74304"
        stroke="#F4F3F5"
        strokeWidth="0.513915"
      />
      <g filter="url(#filter1_dddd_14115_6673)">
        <path
          d="M19.1651 55.2487V50.9213L29.2763 41.5591C30.1362 40.7269 30.8574 39.9779 31.44 39.3122C32.0317 38.6464 32.4802 37.9946 32.7853 37.3565C33.0905 36.7093 33.243 36.0112 33.243 35.2622C33.243 34.43 33.0535 33.7134 32.6744 33.1124C32.2953 32.5021 31.7775 32.0351 31.121 31.7115C30.4645 31.3786 29.7201 31.2122 28.8879 31.2122C28.0187 31.2122 27.2605 31.3879 26.6133 31.7392C25.966 32.0906 25.4667 32.5946 25.1153 33.2511C24.7639 33.9076 24.5883 34.6889 24.5883 35.5951H18.8877C18.8877 33.7365 19.3085 32.123 20.1499 30.7545C20.9913 29.386 22.1703 28.3273 23.6867 27.5783C25.2032 26.8293 26.9508 26.4548 28.9295 26.4548C30.9638 26.4548 32.7345 26.8154 34.2417 27.5367C35.7581 28.2487 36.9371 29.238 37.7785 30.5048C38.6199 31.7716 39.0406 33.2233 39.0406 34.86C39.0406 35.9326 38.828 36.9913 38.4026 38.0362C37.9865 39.081 37.2422 40.2415 36.1696 41.5175C35.097 42.7843 33.5852 44.3053 31.6341 46.0807L27.4871 50.1445V50.3387H39.4151V55.2487H19.1651Z"
          fill="url(#paint1_linear_14115_6673)"
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6673"
          x="-14.3889"
          y="1.06495"
          width="87.1044"
          height="128.334"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6673" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="9.25047" />
          <feGaussianBlur stdDeviation="4.62523" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.07 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6673" result="effect2_dropShadow_14115_6673" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="20.5566" />
          <feGaussianBlur stdDeviation="6.16698" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6673" result="effect3_dropShadow_14115_6673" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="35.974" />
          <feGaussianBlur stdDeviation="7.19481" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6673" result="effect4_dropShadow_14115_6673" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6673" result="shape" />
        </filter>
        <filter
          id="filter1_dddd_14115_6673"
          x="14.3653"
          y="25.5504"
          width="29.5721"
          height="45.9789"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6673" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6673" result="effect2_dropShadow_14115_6673" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6673" result="effect3_dropShadow_14115_6673" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6673" result="effect4_dropShadow_14115_6673" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6673" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_14115_6673"
          x1="31.7564"
          y1="20.9817"
          x2="31.7564"
          y2="82.7523"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E5E5E5" />
          <stop offset="1" stopColor="#68FFD9" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_14115_6673"
          x1="22.8915"
          y1="40.7487"
          x2="38.2503"
          y2="40.7487"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#049571" />
          <stop offset="1" stopColor="#024A39" />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}

export default function TierLevel2Big({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();

  return mode === 'light' ? (
    <TierLevel2BigLight size={size} {...props} />
  ) : (
    <TierLevel2BigDark size={size} {...props} />
  );
}
