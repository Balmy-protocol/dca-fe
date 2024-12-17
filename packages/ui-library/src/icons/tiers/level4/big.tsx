import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../../components/svgicon';
import { useTheme } from 'styled-components';

interface IconProps extends SvgIconProps {
  size?: string;
}

export function TierLevel4BigLight({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 58 76" style={size ? { fontSize: size } : {}} {...props}>
      <g filter="url(#filter0_dddd_14115_6725)">
        <path
          d="M-0.162598 8.9574C-0.162598 7.1564 1.04101 5.57749 2.77765 5.10034L7.12806 3.90503L28.297 0.125522C28.762 0.0424971 29.2381 0.0424969 29.7031 0.125521L50.872 3.90503L55.2225 5.10034C56.9591 5.57749 58.1627 7.1564 58.1627 8.9574V65.4207C58.1627 67.253 56.9178 68.851 55.1412 69.2992L51.9253 70.1105C51.2356 70.2845 50.6048 70.6392 50.0979 71.1382L46.7034 74.4791C45.7395 75.4278 44.3615 75.8252 43.0404 75.5354L36.2907 74.0548L30.044 72.3659C29.3603 72.1811 28.6398 72.1811 27.9561 72.3659L21.7094 74.0548L15.5301 75.4514C14.2977 75.73 13.0062 75.4099 12.0465 74.5881L7.84112 70.9868C7.37212 70.5852 6.81651 70.2976 6.21781 70.1465L2.85894 69.2992C1.08233 68.851 -0.162598 67.253 -0.162598 65.4207V8.9574Z"
          fill="url(#paint0_radial_14115_6725)"
        />
        <path
          d="M0.74188 8.9574C0.74188 7.56364 1.67333 6.34175 3.01728 5.97249L7.32778 4.78815L28.456 1.01592C28.8158 0.951668 29.1843 0.951668 29.5441 1.01592L50.6723 4.78815L54.9828 5.97249C56.3268 6.34175 57.2582 7.56364 57.2582 8.9574V65.4207C57.2582 66.8386 56.2948 68.0753 54.9199 68.4222L51.704 69.2335C50.8584 69.4468 50.085 69.8818 49.4634 70.4935L46.0689 73.8345C45.323 74.5687 44.2566 74.8762 43.2342 74.652L36.5059 73.176L30.2801 71.4928C29.4418 71.2661 28.5583 71.2661 27.72 71.4928L21.4915 73.1768L15.3307 74.5692C14.377 74.7848 13.3775 74.5371 12.6348 73.9011L8.42943 70.2998C7.85439 69.8074 7.17314 69.4547 6.43905 69.2695L3.08019 68.4222C1.70531 68.0753 0.74188 66.8386 0.74188 65.4207V8.9574Z"
          stroke="#791AFF"
          strokeWidth="1.80895"
        />
      </g>
      <g filter="url(#filter1_dddd_14115_6725)">
        <rect x="7" y="12" width="43.5" height="52.4193" rx="2.63834" fill="url(#paint1_linear_14115_6725)" />
        <rect
          x="7.25"
          y="12.25"
          width="43"
          height="51.9193"
          rx="2.38834"
          stroke="url(#paint2_linear_14115_6725)"
          strokeWidth="0.5"
        />
        <g filter="url(#filter2_dddd_14115_6725)">
          <path
            d="M17.3871 47.7164V42.9868L29.2459 24.3041H33.3236V30.8507H30.9103L23.4344 42.6817V42.9036H40.2863V47.7164H17.3871ZM31.0212 52.7096V46.274L31.1322 44.1796V24.3041H36.7633V52.7096H31.0212Z"
            fill="url(#paint3_linear_14115_6725)"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6725"
          x="-14.5522"
          y="-3.02026"
          width="87.1044"
          height="129.012"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6725" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="9.25047" />
          <feGaussianBlur stdDeviation="4.62523" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.07 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6725" result="effect2_dropShadow_14115_6725" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="20.5566" />
          <feGaussianBlur stdDeviation="6.16698" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6725" result="effect3_dropShadow_14115_6725" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="35.974" />
          <feGaussianBlur stdDeviation="7.19481" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6725" result="effect4_dropShadow_14115_6725" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6725" result="shape" />
        </filter>
        <filter
          id="filter1_dddd_14115_6725"
          x="-7.38961"
          y="8.91651"
          width="72.2792"
          height="105.866"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6725" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="9.25047" />
          <feGaussianBlur stdDeviation="4.62523" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.07 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6725" result="effect2_dropShadow_14115_6725" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="20.5566" />
          <feGaussianBlur stdDeviation="6.16698" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6725" result="effect3_dropShadow_14115_6725" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="35.974" />
          <feGaussianBlur stdDeviation="7.19481" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6725" result="effect4_dropShadow_14115_6725" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6725" result="shape" />
        </filter>
        <filter
          id="filter2_dddd_14115_6725"
          x="12.8648"
          y="23.3996"
          width="31.9439"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6725" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6725" result="effect2_dropShadow_14115_6725" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6725" result="effect3_dropShadow_14115_6725" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6725" result="effect4_dropShadow_14115_6725" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6725" result="shape" />
        </filter>
        <radialGradient
          id="paint0_radial_14115_6725"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(30.3374 75.8219) rotate(-90) scale(77.9258 144.469)"
        >
          <stop stopColor="#30263E" />
          <stop offset="0.498523" stopColor="#6525BF" />
          <stop offset="1" stopColor="#30263E" />
        </radialGradient>
        <linearGradient
          id="paint1_linear_14115_6725"
          x1="30.6839"
          y1="12"
          x2="30.684"
          y2="64.4193"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3E344D" stopOpacity="0.8" />
          <stop offset="0.527557" stopColor="#552599" stopOpacity="0.8" />
          <stop offset="1" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_14115_6725"
          x1="27.8829"
          y1="11.7154"
          x2="11.5466"
          y2="8.89488"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4D2584" />
          <stop offset="1" stopColor="#8F78AD" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_14115_6725"
          x1="33.2178"
          y1="26.3209"
          x2="33.2178"
          y2="52.9818"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="#9D9D9D" />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}

export function TierLevel4BigDark({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 58 76" style={size ? { fontSize: size } : {}} {...props}>
      <g filter="url(#filter0_dddd_14115_6729)">
        <path
          d="M-0.162598 8.9574C-0.162598 7.1564 1.04101 5.57749 2.77765 5.10034L7.12806 3.90503L28.297 0.125522C28.762 0.0424971 29.2381 0.0424969 29.7031 0.125521L50.872 3.90503L55.2225 5.10034C56.9591 5.57749 58.1627 7.1564 58.1627 8.9574V65.4207C58.1627 67.253 56.9178 68.851 55.1412 69.2992L51.9253 70.1105C51.2356 70.2845 50.6048 70.6392 50.0979 71.1382L46.7034 74.4791C45.7395 75.4278 44.3615 75.8252 43.0404 75.5354L36.2907 74.0548L30.044 72.3659C29.3603 72.1811 28.6398 72.1811 27.9561 72.3659L21.7094 74.0548L15.5301 75.4514C14.2977 75.73 13.0062 75.4099 12.0465 74.5881L7.84112 70.9868C7.37212 70.5852 6.81651 70.2976 6.21781 70.1465L2.85894 69.2992C1.08233 68.851 -0.162598 67.253 -0.162598 65.4207V8.9574Z"
          fill="url(#paint0_radial_14115_6729)"
        />
        <path
          d="M0.74188 8.9574C0.74188 7.56364 1.67333 6.34175 3.01728 5.97249L7.32778 4.78815L28.456 1.01592C28.8158 0.951668 29.1843 0.951668 29.5441 1.01592L50.6723 4.78815L54.9828 5.97249C56.3268 6.34175 57.2582 7.56364 57.2582 8.9574V65.4207C57.2582 66.8386 56.2948 68.0753 54.9199 68.4222L51.704 69.2335C50.8584 69.4468 50.085 69.8818 49.4634 70.4935L46.0689 73.8345C45.323 74.5687 44.2566 74.8762 43.2342 74.652L36.5059 73.176L30.2801 71.4928C29.4418 71.2661 28.5583 71.2661 27.72 71.4928L21.4915 73.1768L15.3307 74.5692C14.377 74.7848 13.3775 74.5371 12.6348 73.9011L8.42943 70.2998C7.85439 69.8074 7.17314 69.4547 6.43905 69.2695L3.08019 68.4222C1.70531 68.0753 0.74188 66.8386 0.74188 65.4207V8.9574Z"
          stroke="#07F8BD"
          strokeWidth="1.80895"
        />
      </g>
      <g filter="url(#filter1_dddd_14115_6729)">
        <rect x="7" y="12" width="43.5" height="52.4193" rx="2.63834" fill="url(#paint1_linear_14115_6729)" />
        <rect
          x="7.25"
          y="12.25"
          width="43"
          height="51.9193"
          rx="2.38834"
          stroke="url(#paint2_linear_14115_6729)"
          strokeWidth="0.5"
        />
        <g filter="url(#filter2_dddd_14115_6729)">
          <path
            d="M17.3871 47.7164V42.9868L29.2459 24.3041H33.3236V30.8507H30.9103L23.4344 42.6817V42.9036H40.2863V47.7164H17.3871ZM31.0212 52.7096V46.274L31.1322 44.1796V24.3041H36.7633V52.7096H31.0212Z"
            fill="url(#paint3_linear_14115_6729)"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6729"
          x="-14.5522"
          y="-3.02026"
          width="87.1044"
          height="129.012"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6729" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="9.25047" />
          <feGaussianBlur stdDeviation="4.62523" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.07 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6729" result="effect2_dropShadow_14115_6729" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="20.5566" />
          <feGaussianBlur stdDeviation="6.16698" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6729" result="effect3_dropShadow_14115_6729" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="35.974" />
          <feGaussianBlur stdDeviation="7.19481" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6729" result="effect4_dropShadow_14115_6729" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6729" result="shape" />
        </filter>
        <filter
          id="filter1_dddd_14115_6729"
          x="-7.38961"
          y="8.91651"
          width="72.2792"
          height="105.866"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6729" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="9.25047" />
          <feGaussianBlur stdDeviation="4.62523" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.07 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6729" result="effect2_dropShadow_14115_6729" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="20.5566" />
          <feGaussianBlur stdDeviation="6.16698" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6729" result="effect3_dropShadow_14115_6729" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="35.974" />
          <feGaussianBlur stdDeviation="7.19481" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6729" result="effect4_dropShadow_14115_6729" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6729" result="shape" />
        </filter>
        <filter
          id="filter2_dddd_14115_6729"
          x="12.8648"
          y="23.3996"
          width="31.9439"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6729" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6729" result="effect2_dropShadow_14115_6729" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6729" result="effect3_dropShadow_14115_6729" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6729" result="effect4_dropShadow_14115_6729" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6729" result="shape" />
        </filter>
        <radialGradient
          id="paint0_radial_14115_6729"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(30.3374 75.8219) rotate(-90) scale(77.9258 144.469)"
        >
          <stop stopColor="#011913" />
          <stop offset="0.498523" stopColor="#07DFAA" />
          <stop offset="1" stopColor="#011913" />
        </radialGradient>
        <linearGradient
          id="paint1_linear_14115_6729"
          x1="30.6839"
          y1="12"
          x2="30.684"
          y2="64.4193"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#011913" stopOpacity="0.8" />
          <stop offset="0.527557" stopColor="#024A39" stopOpacity="0.8" />
          <stop offset="1" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_14115_6729"
          x1="27.8829"
          y1="11.7154"
          x2="11.5466"
          y2="8.89488"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#024A39" />
          <stop offset="1" stopColor="#78AD9B" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_14115_6729"
          x1="33.2178"
          y1="26.3209"
          x2="33.2178"
          y2="52.9818"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="#9D9D9D" />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}

export default function TierLevel4Big({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();

  return mode === 'light' ? (
    <TierLevel4BigLight size={size} {...props} />
  ) : (
    <TierLevel4BigDark size={size} {...props} />
  );
}
