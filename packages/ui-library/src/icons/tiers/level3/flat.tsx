import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../../components/svgicon';
import { colors } from '../../../theme';
import { useTheme } from 'styled-components';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function TierLevel3Flat({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();

  return (
    <CustomSvgIcon viewBox="0 0 14 18" style={size ? { fontSize: size } : {}} {...props} sx={{ fill: 'transparent' }}>
      <path
        d="M0.890625 4.29425C0.890625 3.682 1.26272 3.1312 1.83072 2.90266L6.29117 1.10799C6.65044 0.96343 7.05171 0.963429 7.41098 1.10799L11.8714 2.90266C12.4394 3.1312 12.8115 3.682 12.8115 4.29425V13.2633C12.8115 13.8751 12.44 14.4256 11.8726 14.6544L7.41212 16.4533C7.05218 16.5985 6.64997 16.5985 6.29003 16.4533L1.82958 14.6544C1.26218 14.4256 0.890625 13.8751 0.890625 13.2633V4.29425Z"
        stroke={colors[mode].typography.typo4}
      />
      <g filter="url(#filter0_dddd_14115_6694)">
        <path
          d="M6.83287 12.3807C6.30257 12.3807 5.83027 12.2895 5.41597 12.1072C5.00404 11.9226 4.67852 11.6693 4.43941 11.3473C4.20267 11.023 4.08074 10.6489 4.07364 10.2251H5.62194C5.63141 10.4027 5.68941 10.5589 5.79594 10.6939C5.90484 10.8265 6.04926 10.9295 6.22918 11.0028C6.40911 11.0762 6.61152 11.1129 6.83643 11.1129C7.0708 11.1129 7.27795 11.0715 7.45787 10.9886C7.6378 10.9058 7.77866 10.791 7.88046 10.6442C7.98226 10.4974 8.03316 10.3281 8.03316 10.1364C8.03316 9.94223 7.97871 9.7706 7.86981 9.62145C7.76327 9.46993 7.60939 9.35156 7.40816 9.26634C7.20929 9.18111 6.97255 9.13849 6.69793 9.13849H6.01966V8.00923H6.69793C6.92994 8.00923 7.13472 7.96899 7.31228 7.88849C7.4922 7.808 7.63188 7.69673 7.73131 7.55469C7.83074 7.41027 7.88046 7.24219 7.88046 7.05043C7.88046 6.86813 7.83666 6.70833 7.74907 6.57102C7.66384 6.43134 7.5431 6.32244 7.38685 6.24432C7.23297 6.16619 7.05305 6.12713 6.84708 6.12713C6.63875 6.12713 6.44817 6.16501 6.27535 6.24077C6.10252 6.31416 5.96403 6.41951 5.85986 6.55682C5.7557 6.69413 5.70006 6.85511 5.69296 7.03977H4.21924C4.22634 6.62074 4.3459 6.25142 4.5779 5.93182C4.80991 5.61222 5.12241 5.36245 5.5154 5.18253C5.91076 5.00024 6.35702 4.90909 6.85418 4.90909C7.35608 4.90909 7.79523 5.00024 8.17165 5.18253C8.54807 5.36482 8.84045 5.61103 9.04878 5.92116C9.25948 6.22893 9.36365 6.57457 9.36128 6.9581C9.36365 7.36529 9.23699 7.70502 8.98131 7.97727C8.728 8.24953 8.39774 8.42235 7.99054 8.49574V8.55256C8.52558 8.62121 8.93278 8.80705 9.21214 9.11009C9.49386 9.41075 9.63354 9.78717 9.63117 10.2393C9.63354 10.6536 9.51398 11.0218 9.27251 11.3438C9.0334 11.6657 8.70314 11.919 8.28174 12.1037C7.86034 12.2884 7.37738 12.3807 6.83287 12.3807Z"
          fill={colors[mode].typography.typo4}
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
