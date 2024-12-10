import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function TierLevel2Big({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 88 128" style={size ? { fontSize: size } : {}} {...props}>
      <g filter="url(#filter0_dddd_2750_122206)">
        <path
          d="M15.0007 12.7045C15.0007 11.598 15.6911 10.6091 16.7298 10.2278L23.4854 7.74762C36.8351 2.84663 51.4916 2.84663 64.8413 7.74762L71.5969 10.2278C72.6356 10.6091 73.326 11.598 73.326 12.7045V70.542C73.326 71.6561 72.6262 72.6501 71.5774 73.0258L64.3975 75.5978C51.3151 80.2842 37.0116 80.2842 23.9292 75.5978L16.7493 73.0258C15.7005 72.6501 15.0007 71.6561 15.0007 70.542V12.7045Z"
          fill="url(#paint0_linear_2750_122206)"
        />
        <path
          d="M15.9052 12.7045C15.9052 11.9773 16.3589 11.3274 17.0415 11.0768L23.7971 8.59669C36.9456 3.76958 51.3812 3.76957 64.5296 8.59668L71.2852 11.0768C71.9678 11.3274 72.4216 11.9773 72.4216 12.7045V70.542C72.4216 71.2742 71.9617 71.9274 71.2724 72.1743L64.0925 74.7463C51.2073 79.362 37.1194 79.362 24.2342 74.7463L17.0544 72.1743C16.3651 71.9274 15.9052 71.2742 15.9052 70.542V12.7045Z"
          stroke="#AB8A07"
          strokeWidth="1.80895"
        />
      </g>
      <rect x="22.67" y="15.546" width="42.987" height="51.9054" rx="3.74304" fill="#F4F2F7" fillOpacity="0.4" />
      <rect x="22.67" y="15.546" width="42.987" height="51.9054" rx="3.74304" stroke="#F4F3F5" strokeWidth="0.513915" />
      <g filter="url(#filter1_dddd_2750_122206)">
        <path
          d="M34.1651 55.5V51.1726L44.2763 41.8104C45.1362 40.9783 45.8574 40.2293 46.44 39.5635C47.0317 38.8978 47.4802 38.2459 47.7853 37.6079C48.0905 36.9606 48.243 36.2625 48.243 35.5135C48.243 34.6813 48.0535 33.9647 47.6744 33.3637C47.2953 32.7534 46.7775 32.2865 46.121 31.9628C45.4645 31.63 44.7201 31.4635 43.8879 31.4635C43.0187 31.4635 42.2605 31.6392 41.6133 31.9906C40.966 32.342 40.4667 32.8459 40.1153 33.5024C39.7639 34.1589 39.5883 34.9402 39.5883 35.8464H33.8877C33.8877 33.9878 34.3085 32.3743 35.1499 31.0058C35.9913 29.6373 37.1703 28.5786 38.6867 27.8296C40.2032 27.0807 41.9508 26.7062 43.9295 26.7062C45.9638 26.7062 47.7345 27.0668 49.2417 27.788C50.7581 28.5 51.9371 29.4894 52.7785 30.7562C53.6199 32.023 54.0406 33.4747 54.0406 35.1113C54.0406 36.1839 53.828 37.2426 53.4026 38.2875C52.9865 39.3324 52.2422 40.4928 51.1696 41.7688C50.097 43.0356 48.5852 44.5567 46.6341 46.332L42.4871 50.3959V50.5901H54.4151V55.5H34.1651Z"
          fill="url(#paint1_linear_2750_122206)"
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_2750_122206"
          x="0.611119"
          y="0.986824"
          width="87.1044"
          height="128.49"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2750_122206" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="9.25047" />
          <feGaussianBlur stdDeviation="4.62523" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.07 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_2750_122206" result="effect2_dropShadow_2750_122206" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="20.5566" />
          <feGaussianBlur stdDeviation="6.16698" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_2750_122206" result="effect3_dropShadow_2750_122206" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="35.974" />
          <feGaussianBlur stdDeviation="7.19481" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_2750_122206" result="effect4_dropShadow_2750_122206" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_2750_122206" result="shape" />
        </filter>
        <filter
          id="filter1_dddd_2750_122206"
          x="29.3653"
          y="25.8026"
          width="29.5721"
          height="45.978"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2750_122206" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_2750_122206" result="effect2_dropShadow_2750_122206" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_2750_122206" result="effect3_dropShadow_2750_122206" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_2750_122206" result="effect4_dropShadow_2750_122206" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_2750_122206" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_2750_122206"
          x1="46.7564"
          y1="20.935"
          x2="46.7564"
          y2="82.8461"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EDEAEC" />
          <stop offset="1" stopColor="#FCEEB6" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2750_122206"
          x1="44.1636"
          y1="15.5"
          x2="44.1636"
          y2="67.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#CCA509" />
          <stop offset="1" stopColor="#665305" />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}
