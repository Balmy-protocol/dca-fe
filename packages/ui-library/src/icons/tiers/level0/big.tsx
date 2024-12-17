import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../../components/svgicon';
import { useTheme } from 'styled-components';

interface IconProps extends SvgIconProps {
  size?: string;
}

export function TierLevel0BigLight({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 59 72" style={size ? { fontSize: size } : {}} {...props}>
      <g filter="url(#filter0_dddd_14115_6697)">
        <path
          d="M0 3.28019C0 1.82308 1.18123 0.641846 2.63834 0.641846L29.1626 0.641846L55.687 0.641846C57.1441 0.641846 58.3253 1.82307 58.3253 3.28019V69.0012C58.3253 70.4583 57.1441 71.6395 55.687 71.6395H29.1626H2.63834C1.18123 71.6395 0 70.4583 0 69.0012L0 3.28019Z"
          fill="url(#paint0_linear_14115_6697)"
        />
        <path
          d="M0.904477 3.28019C0.904477 2.3226 1.68076 1.54632 2.63834 1.54632H29.1626H55.687C56.6445 1.54632 57.4208 2.3226 57.4208 3.28019V69.0012C57.4208 69.9588 56.6445 70.735 55.687 70.735H29.1626H2.63834C1.68075 70.735 0.904477 69.9588 0.904477 69.0012V3.28019Z"
          stroke="url(#paint1_linear_14115_6697)"
          strokeWidth="1.80895"
        />
      </g>
      <rect x="7.4126" y="9.92969" width="43.5" height="52.4193" rx="4" fill="#F4F2F7" fillOpacity="0.4" />
      <rect
        x="7.66956"
        y="10.1866"
        width="42.9861"
        height="51.9054"
        rx="3.74304"
        stroke="#F9F7FD"
        strokeOpacity="0.5"
        strokeWidth="0.513915"
      />
      <g filter="url(#filter1_dddd_14115_6697)">
        <path
          d="M29.1574 51.2634C26.7718 51.2542 24.7191 50.667 22.9992 49.502C21.2886 48.3369 19.9709 46.6494 19.0463 44.4395C18.1309 42.2295 17.6778 39.5711 17.687 36.4643C17.687 33.3667 18.1448 30.7268 19.0602 28.5446C19.9848 26.3624 21.3025 24.7026 23.0131 23.5653C24.7329 22.4187 26.7811 21.8455 29.1574 21.8455C31.5338 21.8455 33.5773 22.4187 35.2879 23.5653C37.0078 24.7119 38.33 26.3763 39.2547 28.5585C40.1793 30.7314 40.637 33.3667 40.6278 36.4643C40.6278 39.5804 40.1655 42.2434 39.2408 44.4533C38.3254 46.6633 37.0124 48.3508 35.3018 49.5158C33.5912 50.6809 31.543 51.2634 29.1574 51.2634ZM29.1574 46.2841C30.7848 46.2841 32.084 45.4658 33.0549 43.8292C34.0257 42.1925 34.5066 39.7376 34.4973 36.4643C34.4973 34.3098 34.2754 32.516 33.8316 31.0828C33.397 29.6496 32.7775 28.5723 31.973 27.8511C31.1778 27.1299 30.2393 26.7693 29.1574 26.7693C27.5393 26.7693 26.2447 27.5783 25.2739 29.1965C24.303 30.8146 23.8129 33.2372 23.8037 36.4643C23.8037 38.6465 24.0209 40.4681 24.4555 41.929C24.8994 43.3807 25.5235 44.4718 26.328 45.2023C27.1324 45.9235 28.0756 46.2841 29.1574 46.2841Z"
          fill="url(#paint2_linear_14115_6697)"
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6697"
          x="-14.3896"
          y="-2.44164"
          width="87.1044"
          height="124.445"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6697" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="9.25047" />
          <feGaussianBlur stdDeviation="4.62523" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.07 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6697" result="effect2_dropShadow_14115_6697" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="20.5566" />
          <feGaussianBlur stdDeviation="6.16698" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6697" result="effect3_dropShadow_14115_6697" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="35.974" />
          <feGaussianBlur stdDeviation="7.19481" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6697" result="effect4_dropShadow_14115_6697" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6697" result="shape" />
        </filter>
        <filter
          id="filter1_dddd_14115_6697"
          x="13.151"
          y="20.941"
          width="32.013"
          height="46.603"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6697" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6697" result="effect2_dropShadow_14115_6697" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6697" result="effect3_dropShadow_14115_6697" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6697" result="effect4_dropShadow_14115_6697" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6697" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_14115_6697"
          x1="31.7557"
          y1="18.4825"
          x2="31.7557"
          y2="71.6395"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EADBFF" />
          <stop offset="1" stopColor="#D3B4FF" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_14115_6697"
          x1="28"
          y1="0.255922"
          x2="6.08178"
          y2="-3.48531"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#791AFF" />
          <stop offset="1" stopColor="#791AFF" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_14115_6697"
          x1="22.8908"
          y1="36.1393"
          x2="38.2491"
          y2="36.1393"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#791AFF" />
          <stop offset="1" stopColor="#4A00B3" />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}

export function TierLevel0BigDark({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 59 71" style={size ? { fontSize: size } : {}} {...props}>
      <g filter="url(#filter0_dddd_14115_6701)">
        <path
          d="M0 2.63957C0 1.18245 1.18123 0.0012207 2.63834 0.0012207L29.1626 0.0012207L55.687 0.0012207C57.1441 0.0012207 58.3253 1.18245 58.3253 2.63956V68.3605C58.3253 69.8177 57.1441 70.9989 55.687 70.9989H29.1626H2.63834C1.18123 70.9989 0 69.8177 0 68.3605L0 2.63957Z"
          fill="url(#paint0_linear_14115_6701)"
        />
        <path
          d="M0.904477 2.63957C0.904477 1.68198 1.68076 0.905698 2.63834 0.905698H29.1626H55.687C56.6445 0.905698 57.4208 1.68198 57.4208 2.63956V68.3605C57.4208 69.3181 56.6445 70.0944 55.687 70.0944H29.1626H2.63834C1.68075 70.0944 0.904477 69.3181 0.904477 68.3605V2.63957Z"
          stroke="#049571"
          strokeWidth="1.80895"
        />
      </g>
      <rect x="7.4126" y="9.28906" width="43.5" height="52.4193" rx="4" fill="#F4F2F7" fillOpacity="0.4" />
      <rect
        x="7.66956"
        y="9.54602"
        width="42.9861"
        height="51.9054"
        rx="3.74304"
        stroke="#F9F7FD"
        strokeOpacity="0.5"
        strokeWidth="0.513915"
      />
      <g filter="url(#filter1_dddd_14115_6701)">
        <path
          d="M29.1574 50.6228C26.7718 50.6136 24.7191 50.0264 22.9992 48.8613C21.2886 47.6963 19.9709 46.0088 19.0463 43.7988C18.1309 41.5889 17.6778 38.9305 17.687 35.8237C17.687 32.7261 18.1448 30.0862 19.0602 27.904C19.9848 25.7218 21.3025 24.062 23.0131 22.9247C24.7329 21.7781 26.7811 21.2048 29.1574 21.2048C31.5338 21.2048 33.5773 21.7781 35.2879 22.9247C37.0078 24.0713 38.33 25.7357 39.2547 27.9178C40.1793 30.0908 40.637 32.7261 40.6278 35.8237C40.6278 38.9398 40.1655 41.6028 39.2408 43.8127C38.3254 46.0226 37.0124 47.7101 35.3018 48.8752C33.5912 50.0403 31.543 50.6228 29.1574 50.6228ZM29.1574 45.6435C30.7848 45.6435 32.084 44.8252 33.0549 43.1886C34.0257 41.5519 34.5066 39.0969 34.4973 35.8237C34.4973 33.6692 34.2754 31.8754 33.8316 30.4422C33.397 29.0089 32.7775 27.9317 31.973 27.2105C31.1778 26.4892 30.2393 26.1286 29.1574 26.1286C27.5393 26.1286 26.2447 26.9377 25.2739 28.5559C24.303 30.174 23.8129 32.5966 23.8037 35.8237C23.8037 38.0059 24.0209 39.8274 24.4555 41.2884C24.8994 42.7401 25.5235 43.8312 26.328 44.5617C27.1324 45.2829 28.0756 45.6435 29.1574 45.6435Z"
          fill="url(#paint1_linear_14115_6701)"
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6701"
          x="-14.3896"
          y="-3.08227"
          width="87.1044"
          height="124.445"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6701" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="9.25047" />
          <feGaussianBlur stdDeviation="4.62523" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.07 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6701" result="effect2_dropShadow_14115_6701" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="20.5566" />
          <feGaussianBlur stdDeviation="6.16698" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6701" result="effect3_dropShadow_14115_6701" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="35.974" />
          <feGaussianBlur stdDeviation="7.19481" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6701" result="effect4_dropShadow_14115_6701" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6701" result="shape" />
        </filter>
        <filter
          id="filter1_dddd_14115_6701"
          x="13.151"
          y="20.3004"
          width="32.013"
          height="46.603"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6701" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6701" result="effect2_dropShadow_14115_6701" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6701" result="effect3_dropShadow_14115_6701" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6701" result="effect4_dropShadow_14115_6701" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6701" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_14115_6701"
          x1="31.7557"
          y1="17.8419"
          x2="31.7557"
          y2="70.9989"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E6FFF9" />
          <stop offset="1" stopColor="#B4FFEC" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_14115_6701"
          x1="22.8908"
          y1="35.4987"
          x2="38.2491"
          y2="35.4987"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#049571" />
          <stop offset="1" stopColor="#024A39" />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}

export default function TierLevel0Big({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();

  return mode === 'light' ? (
    <TierLevel0BigLight size={size} {...props} />
  ) : (
    <TierLevel0BigDark size={size} {...props} />
  );
}
