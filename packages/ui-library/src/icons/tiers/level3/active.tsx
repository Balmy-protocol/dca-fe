import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function TierLevel3Active({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 17 17.5619" style={size ? { fontSize: size } : {}} {...props}>
      <path
        d="M1.52783 3.33798C1.52783 3.3035 1.54879 3.27248 1.58078 3.25961L7.45675 0.895392C7.47698 0.887251 7.49958 0.887251 7.51981 0.895392L13.3958 3.25961C13.4278 3.27248 13.4487 3.3035 13.4487 3.33798V14.2187C13.4487 14.2532 13.4278 14.2842 13.3959 14.2971L7.51988 16.6669C7.49961 16.6751 7.47696 16.6751 7.45668 16.6669L1.58071 14.2971C1.54876 14.2842 1.52783 14.2532 1.52783 14.2187V3.33798Z"
        fill="#E9E6FF"
        stroke="url(#paint0_linear_2750_122204)"
      />
      <g filter="url(#filter0_dddd_2750_122204)">
        <path
          d="M7.47008 12.3807C6.93978 12.3807 6.46748 12.2895 6.05318 12.1072C5.64125 11.9226 5.31573 11.6693 5.07662 11.3473C4.83987 11.023 4.71795 10.6489 4.71085 10.2251H6.25914C6.26861 10.4027 6.32662 10.5589 6.43315 10.6939C6.54205 10.8265 6.68646 10.9295 6.86639 11.0028C7.04631 11.0762 7.24873 11.1129 7.47363 11.1129C7.70801 11.1129 7.91516 11.0715 8.09508 10.9886C8.27501 10.9058 8.41587 10.791 8.51767 10.6442C8.61947 10.4974 8.67037 10.3281 8.67037 10.1364C8.67037 9.94223 8.61591 9.7706 8.50701 9.62145C8.40048 9.46993 8.2466 9.35156 8.04537 9.26634C7.8465 9.18111 7.60976 9.13849 7.33514 9.13849H6.65687V8.00923H7.33514C7.56715 8.00923 7.77193 7.96899 7.94949 7.88849C8.12941 7.808 8.26909 7.69673 8.36852 7.55469C8.46795 7.41027 8.51767 7.24219 8.51767 7.05043C8.51767 6.86813 8.47387 6.70833 8.38627 6.57102C8.30105 6.43134 8.18031 6.32244 8.02406 6.24432C7.87018 6.16619 7.69025 6.12713 7.48429 6.12713C7.27595 6.12713 7.08538 6.16501 6.91255 6.24077C6.73973 6.31416 6.60124 6.41951 6.49707 6.55682C6.3929 6.69413 6.33727 6.85511 6.33017 7.03977H4.85645C4.86355 6.62074 4.9831 6.25142 5.21511 5.93182C5.44712 5.61222 5.75962 5.36245 6.15261 5.18253C6.54797 5.00024 6.99423 4.90909 7.49139 4.90909C7.99328 4.90909 8.43244 5.00024 8.80886 5.18253C9.18528 5.36482 9.47766 5.61103 9.68599 5.92116C9.89669 6.22893 10.0009 6.57457 9.99849 6.9581C10.0009 7.36529 9.8742 7.70502 9.61852 7.97727C9.3652 8.24953 9.03495 8.42235 8.62775 8.49574V8.55256C9.16279 8.62121 9.56999 8.80705 9.84934 9.11009C10.1311 9.41075 10.2707 9.78717 10.2684 10.2393C10.2707 10.6536 10.1512 11.0218 9.90971 11.3438C9.6706 11.6657 9.34035 11.919 8.91895 12.1037C8.49754 12.2884 8.01459 12.3807 7.47008 12.3807Z"
          fill="url(#paint1_linear_2750_122204)"
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_2750_122204"
          x="0.18855"
          y="4.00568"
          width="14.6058"
          height="24.6538"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2750_122204" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_2750_122204" result="effect2_dropShadow_2750_122204" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_2750_122204" result="effect3_dropShadow_2750_122204" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_2750_122204" result="effect4_dropShadow_2750_122204" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_2750_122204" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_2750_122204"
          x1="4.24665"
          y1="8.78125"
          x2="12.1847"
          y2="8.78125"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#791AFF" />
          <stop offset="1" stopColor="#4A00B3" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2750_122204"
          x1="6.09887"
          y1="8.78125"
          x2="9.50121"
          y2="8.78125"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#791AFF" />
          <stop offset="1" stopColor="#4A00B3" />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}
