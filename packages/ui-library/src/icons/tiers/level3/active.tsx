import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../../components/svgicon';
import { useTheme } from 'styled-components';

interface IconProps extends SvgIconProps {
  size?: string;
}

export function TierLevel3ActiveLight({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 13 18" style={size ? { fontSize: size } : {}} {...props}>
      <path
        d="M0.527832 4.29425C0.527832 3.682 0.899928 3.1312 1.46792 2.90266L5.92837 1.10799C6.28765 0.96343 6.68891 0.963429 7.04819 1.10799L11.5086 2.90266C12.0766 3.1312 12.4487 3.682 12.4487 4.29425V13.2633C12.4487 13.8751 12.0772 14.4256 11.5098 14.6544L7.04933 16.4533C6.68938 16.5985 6.28718 16.5985 5.92723 16.4533L1.46678 14.6544C0.899391 14.4256 0.527832 13.8751 0.527832 13.2633V4.29425Z"
        fill="#E9E6FF"
        stroke="url(#paint0_linear_14115_6691)"
      />
      <g filter="url(#filter0_dddd_14115_6691)">
        <path
          d="M6.47008 12.3807C5.93978 12.3807 5.46748 12.2895 5.05318 12.1072C4.64125 11.9226 4.31573 11.6693 4.07662 11.3473C3.83987 11.023 3.71795 10.6489 3.71085 10.2251H5.25914C5.26861 10.4027 5.32662 10.5589 5.43315 10.6939C5.54205 10.8265 5.68646 10.9295 5.86639 11.0028C6.04631 11.0762 6.24873 11.1129 6.47363 11.1129C6.70801 11.1129 6.91516 11.0715 7.09508 10.9886C7.27501 10.9058 7.41587 10.791 7.51767 10.6442C7.61947 10.4974 7.67037 10.3281 7.67037 10.1364C7.67037 9.94223 7.61591 9.7706 7.50701 9.62145C7.40048 9.46993 7.2466 9.35156 7.04537 9.26634C6.8465 9.18111 6.60976 9.13849 6.33514 9.13849H5.65687V8.00923H6.33514C6.56715 8.00923 6.77193 7.96899 6.94949 7.88849C7.12941 7.808 7.26909 7.69673 7.36852 7.55469C7.46795 7.41027 7.51767 7.24219 7.51767 7.05043C7.51767 6.86813 7.47387 6.70833 7.38627 6.57102C7.30105 6.43134 7.18031 6.32244 7.02406 6.24432C6.87018 6.16619 6.69025 6.12713 6.48429 6.12713C6.27595 6.12713 6.08538 6.16501 5.91255 6.24077C5.73973 6.31416 5.60124 6.41951 5.49707 6.55682C5.3929 6.69413 5.33727 6.85511 5.33017 7.03977H3.85645C3.86355 6.62074 3.9831 6.25142 4.21511 5.93182C4.44712 5.61222 4.75962 5.36245 5.15261 5.18253C5.54797 5.00024 5.99423 4.90909 6.49139 4.90909C6.99328 4.90909 7.43244 5.00024 7.80886 5.18253C8.18528 5.36482 8.47766 5.61103 8.68599 5.92116C8.89669 6.22893 9.00086 6.57457 8.99849 6.9581C9.00086 7.36529 8.8742 7.70502 8.61852 7.97727C8.3652 8.24953 8.03495 8.42235 7.62775 8.49574V8.55256C8.16279 8.62121 8.56999 8.80705 8.84934 9.11009C9.13107 9.41075 9.27074 9.78717 9.26838 10.2393C9.27074 10.6536 9.15119 11.0218 8.90971 11.3438C8.6706 11.6657 8.34035 11.919 7.91895 12.1037C7.49754 12.2884 7.01459 12.3807 6.47008 12.3807Z"
          fill="url(#paint1_linear_14115_6691)"
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6691"
          x="-0.81145"
          y="4.00458"
          width="14.6058"
          height="24.6568"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6691" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6691" result="effect2_dropShadow_14115_6691" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6691" result="effect3_dropShadow_14115_6691" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6691" result="effect4_dropShadow_14115_6691" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6691" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_14115_6691"
          x1="3.24665"
          y1="8.78125"
          x2="11.1847"
          y2="8.78125"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#791AFF" />
          <stop offset="1" stopColor="#4A00B3" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_14115_6691"
          x1="5.09887"
          y1="8.28125"
          x2="8.50121"
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

export function TierLevel3ActiveDark({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 14 18" style={size ? { fontSize: size } : {}} {...props}>
      <path
        d="M0.890625 4.29425C0.890625 3.682 1.26272 3.1312 1.83072 2.90266L6.29117 1.10799C6.65044 0.96343 7.05171 0.963429 7.41098 1.10799L11.8714 2.90266C12.4394 3.1312 12.8115 3.682 12.8115 4.29425V13.2633C12.8115 13.8751 12.44 14.4256 11.8726 14.6544L7.41212 16.4533C7.05218 16.5985 6.64997 16.5985 6.29003 16.4533L1.82958 14.6544C1.26218 14.4256 0.890625 13.8751 0.890625 13.2633V4.29425Z"
        fill="#024A39"
        stroke="#07DFAA"
      />
      <g filter="url(#filter0_dddd_14115_6694)">
        <path
          d="M6.83287 12.3807C6.30257 12.3807 5.83027 12.2895 5.41597 12.1072C5.00404 11.9226 4.67852 11.6693 4.43941 11.3473C4.20267 11.023 4.08074 10.6489 4.07364 10.2251H5.62194C5.63141 10.4027 5.68941 10.5589 5.79594 10.6939C5.90484 10.8265 6.04926 10.9295 6.22918 11.0028C6.40911 11.0762 6.61152 11.1129 6.83643 11.1129C7.0708 11.1129 7.27795 11.0715 7.45787 10.9886C7.6378 10.9058 7.77866 10.791 7.88046 10.6442C7.98226 10.4974 8.03316 10.3281 8.03316 10.1364C8.03316 9.94223 7.97871 9.7706 7.86981 9.62145C7.76327 9.46993 7.60939 9.35156 7.40816 9.26634C7.20929 9.18111 6.97255 9.13849 6.69793 9.13849H6.01966V8.00923H6.69793C6.92994 8.00923 7.13472 7.96899 7.31228 7.88849C7.4922 7.808 7.63188 7.69673 7.73131 7.55469C7.83074 7.41027 7.88046 7.24219 7.88046 7.05043C7.88046 6.86813 7.83666 6.70833 7.74907 6.57102C7.66384 6.43134 7.5431 6.32244 7.38685 6.24432C7.23297 6.16619 7.05305 6.12713 6.84708 6.12713C6.63875 6.12713 6.44817 6.16501 6.27535 6.24077C6.10252 6.31416 5.96403 6.41951 5.85986 6.55682C5.7557 6.69413 5.70006 6.85511 5.69296 7.03977H4.21924C4.22634 6.62074 4.3459 6.25142 4.5779 5.93182C4.80991 5.61222 5.12241 5.36245 5.5154 5.18253C5.91076 5.00024 6.35702 4.90909 6.85418 4.90909C7.35608 4.90909 7.79523 5.00024 8.17165 5.18253C8.54807 5.36482 8.84045 5.61103 9.04878 5.92116C9.25948 6.22893 9.36365 6.57457 9.36128 6.9581C9.36365 7.36529 9.23699 7.70502 8.98131 7.97727C8.728 8.24953 8.39774 8.42235 7.99054 8.49574V8.55256C8.52558 8.62121 8.93278 8.80705 9.21214 9.11009C9.49386 9.41075 9.63354 9.78717 9.63117 10.2393C9.63354 10.6536 9.51398 11.0218 9.27251 11.3438C9.0334 11.6657 8.70314 11.919 8.28174 12.1037C7.86034 12.2884 7.37738 12.3807 6.83287 12.3807Z"
          fill="white"
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6694"
          x="-0.448657"
          y="4.00458"
          width="14.6058"
          height="24.6568"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6694" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6694" result="effect2_dropShadow_14115_6694" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6694" result="effect3_dropShadow_14115_6694" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6694" result="effect4_dropShadow_14115_6694" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6694" result="shape" />
        </filter>
      </defs>
    </CustomSvgIcon>
  );
}

export default function TierLevel3Active({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();

  return mode === 'light' ? (
    <TierLevel3ActiveLight size={size} {...props} />
  ) : (
    <TierLevel3ActiveDark size={size} {...props} />
  );
}
