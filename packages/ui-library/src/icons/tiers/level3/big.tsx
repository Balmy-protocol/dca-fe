import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../../components/svgicon';
import { useTheme } from 'styled-components';

interface IconProps extends SvgIconProps {
  size?: string;
}

export function TierLevel3BigLight({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 59 77" style={size ? { fontSize: size } : {}} {...props}>
      <g filter="url(#filter0_dddd_14115_6683)">
        <path
          d="M0.325684 12.843C0.325684 9.63463 2.50681 6.83698 5.61827 6.05441L27.537 0.541566C28.8179 0.219393 30.1587 0.219393 31.4397 0.541566L53.3584 6.05441C56.4699 6.83698 58.651 9.63462 58.651 12.843V63.0608C58.651 66.2312 56.5202 69.0058 53.4571 69.8238L31.5525 75.6737C30.2001 76.0349 28.7766 76.0349 27.4242 75.6737L5.51955 69.8238C2.45651 69.0058 0.325684 66.2312 0.325684 63.0609V12.843Z"
          fill="url(#paint0_linear_14115_6683)"
        />
        <path
          d="M1.23016 12.843C1.23016 10.0492 3.12947 7.61302 5.83889 6.93157L27.7576 1.41872C28.8937 1.13298 30.0829 1.13298 31.219 1.41872L53.1378 6.93157C55.8472 7.61302 57.7465 10.0492 57.7465 12.843V63.0608C57.7465 65.8216 55.891 68.2377 53.2237 68.95L31.3191 74.7999C30.1196 75.1202 28.8571 75.1202 27.6576 74.7999L5.75292 68.95C3.08566 68.2377 1.23016 65.8216 1.23016 63.0609V12.843Z"
          stroke="url(#paint1_linear_14115_6683)"
          strokeWidth="1.80895"
        />
      </g>
      <rect x="7.73828" y="15.1367" width="43.5" height="46" rx="4" fill="#F4F2F7" fillOpacity="0.4" />
      <rect
        x="7.99524"
        y="15.3937"
        width="42.9861"
        height="45.4861"
        rx="3.74304"
        stroke="#F9F7FD"
        strokeOpacity="0.5"
        strokeWidth="0.513915"
      />
      <g filter="url(#filter1_dddd_14115_6683)">
        <path
          d="M29.4172 53.0251C27.346 53.0251 25.5013 52.6691 23.8831 51.9571C22.2742 51.2359 21.0028 50.2465 20.0689 48.9889C19.1443 47.7222 18.6681 46.2612 18.6403 44.6061H24.6876C24.7246 45.2996 24.9511 45.9098 25.3672 46.4369C25.7926 46.9547 26.3566 47.3569 27.0593 47.6436C27.7621 47.9302 28.5527 48.0735 29.4311 48.0735C30.3465 48.0735 31.1556 47.9117 31.8583 47.5881C32.5611 47.2645 33.1112 46.816 33.5088 46.2427C33.9064 45.6694 34.1052 45.0083 34.1052 44.2593C34.1052 43.5011 33.8926 42.8307 33.4672 42.2482C33.0511 41.6564 32.4501 41.1941 31.6641 40.8612C30.8874 40.5283 29.9628 40.3619 28.8902 40.3619H26.241V35.9513H28.8902C29.7963 35.9513 30.5962 35.7941 31.2897 35.4797C31.9924 35.1653 32.5379 34.7307 32.9263 34.1759C33.3147 33.6119 33.5088 32.9554 33.5088 32.2064C33.5088 31.4944 33.3378 30.8703 32.9956 30.334C32.6628 29.7884 32.1912 29.3631 31.5809 29.058C30.9799 28.7528 30.2772 28.6003 29.4727 28.6003C28.659 28.6003 27.9147 28.7482 27.2397 29.0441C26.5647 29.3307 26.0237 29.7422 25.6169 30.2785C25.21 30.8148 24.9927 31.4436 24.965 32.1648H19.209C19.2367 30.5282 19.7037 29.0857 20.6099 27.8374C21.516 26.5891 22.7366 25.6136 24.2715 24.9109C25.8157 24.1989 27.5587 23.8429 29.5004 23.8429C31.4607 23.8429 33.176 24.1989 34.6462 24.9109C36.1164 25.6229 37.2583 26.5845 38.072 27.7958C38.895 28.9979 39.3018 30.3479 39.2926 31.8458C39.3018 33.4362 38.8071 34.7631 37.8085 35.8264C36.8191 36.8898 35.5292 37.5648 33.9388 37.8514V38.0734C36.0285 38.3415 37.6189 39.0674 38.71 40.2509C39.8104 41.4252 40.3559 42.8955 40.3467 44.6615C40.3559 46.2797 39.889 47.7175 38.9458 48.9751C38.0119 50.2326 36.722 51.222 35.0761 51.9432C33.4302 52.6645 31.5439 53.0251 29.4172 53.0251Z"
          fill="url(#paint2_linear_14115_6683)"
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6683"
          x="-14.0639"
          y="-2.78356"
          width="87.1044"
          height="129.092"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6683" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="9.25047" />
          <feGaussianBlur stdDeviation="4.62523" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.07 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6683" result="effect2_dropShadow_14115_6683" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="20.5566" />
          <feGaussianBlur stdDeviation="6.16698" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6683" result="effect3_dropShadow_14115_6683" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="35.974" />
          <feGaussianBlur stdDeviation="7.19481" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6683" result="effect4_dropShadow_14115_6683" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6683" result="shape" />
        </filter>
        <filter
          id="filter1_dddd_14115_6683"
          x="14.118"
          y="22.9384"
          width="30.765"
          height="46.3672"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6683" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6683" result="effect2_dropShadow_14115_6683" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6683" result="effect3_dropShadow_14115_6683" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6683" result="effect4_dropShadow_14115_6683" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6683" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_14115_6683"
          x1="32.0814"
          y1="19.1923"
          x2="32.0814"
          y2="76.225"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E3CFFF" />
          <stop offset="1" stopColor="#8025FF" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_14115_6683"
          x1="28.3257"
          y1="-0.363281"
          x2="6.32568"
          y2="-3.86328"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#791AFF" />
          <stop offset="1" stopColor="#791AFF" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_14115_6683"
          x1="23.2165"
          y1="38.1367"
          x2="38.5747"
          y2="38.1367"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#791AFF" />
          <stop offset="1" stopColor="#4A00B3" />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}

export function TierLevel3BigDark({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 59 77" style={size ? { fontSize: size } : {}} {...props}>
      <g filter="url(#filter0_dddd_14115_6687)">
        <path
          d="M0.325684 12.7922C0.325684 9.58385 2.50681 6.7862 5.61827 6.00363L27.537 0.490784C28.8179 0.168612 30.1587 0.168612 31.4397 0.490785L53.3584 6.00363C56.4699 6.7862 58.651 9.58384 58.651 12.7922V63.0101C58.651 66.1805 56.5202 68.955 53.4571 69.773L31.5525 75.6229C30.2001 75.9841 28.7766 75.9841 27.4242 75.6229L5.51955 69.773C2.45651 68.955 0.325684 66.1805 0.325684 63.0101V12.7922Z"
          fill="url(#paint0_linear_14115_6687)"
        />
        <path
          d="M1.23016 12.7922C1.23016 9.9984 3.12947 7.56224 5.83889 6.88079L27.7576 1.36794C28.8937 1.0822 30.0829 1.0822 31.219 1.36794L53.1378 6.88079C55.8472 7.56224 57.7465 9.9984 57.7465 12.7922V63.0101C57.7465 65.7708 55.891 68.1869 53.2237 68.8992L31.3191 74.7491C30.1196 75.0694 28.8571 75.0694 27.6576 74.7491L5.75292 68.8992C3.08566 68.1869 1.23016 65.7708 1.23016 63.0101V12.7922Z"
          stroke="#049571"
          strokeWidth="1.80895"
        />
      </g>
      <rect x="7.73828" y="15.0859" width="43.5" height="46" rx="4" fill="#F4F2F7" fillOpacity="0.4" />
      <rect
        x="7.99524"
        y="15.3429"
        width="42.9861"
        height="45.4861"
        rx="3.74304"
        stroke="#F9F7FD"
        strokeOpacity="0.5"
        strokeWidth="0.513915"
      />
      <g filter="url(#filter1_dddd_14115_6687)">
        <path
          d="M29.4172 52.9743C27.346 52.9743 25.5013 52.6183 23.8831 51.9063C22.2742 51.1851 21.0028 50.1957 20.0689 48.9382C19.1443 47.6714 18.6681 46.2104 18.6403 44.5553H24.6876C24.7246 45.2488 24.9511 45.8591 25.3672 46.3861C25.7926 46.9039 26.3566 47.3061 27.0593 47.5928C27.7621 47.8794 28.5527 48.0228 29.4311 48.0228C30.3465 48.0228 31.1556 47.8609 31.8583 47.5373C32.5611 47.2137 33.1112 46.7652 33.5088 46.1919C33.9064 45.6186 34.1052 44.9575 34.1052 44.2085C34.1052 43.4503 33.8926 42.7799 33.4672 42.1974C33.0511 41.6056 32.4501 41.1433 31.6641 40.8104C30.8874 40.4776 29.9628 40.3111 28.8902 40.3111H26.241V35.9005H28.8902C29.7963 35.9005 30.5962 35.7433 31.2897 35.4289C31.9924 35.1145 32.5379 34.6799 32.9263 34.1252C33.3147 33.5611 33.5088 32.9046 33.5088 32.1556C33.5088 31.4437 33.3378 30.8195 32.9956 30.2832C32.6628 29.7377 32.1912 29.3123 31.5809 29.0072C30.9799 28.702 30.2772 28.5495 29.4727 28.5495C28.659 28.5495 27.9147 28.6974 27.2397 28.9933C26.5647 29.28 26.0237 29.6914 25.6169 30.2277C25.21 30.764 24.9927 31.3928 24.965 32.114H19.209C19.2367 30.4774 19.7037 29.0349 20.6099 27.7866C21.516 26.5383 22.7366 25.5628 24.2715 24.8601C25.8157 24.1481 27.5587 23.7921 29.5004 23.7921C31.4607 23.7921 33.176 24.1481 34.6462 24.8601C36.1164 25.5721 37.2583 26.5337 38.072 27.745C38.895 28.9471 39.3018 30.2971 39.2926 31.795C39.3018 33.3854 38.8071 34.7123 37.8085 35.7757C36.8191 36.839 35.5292 37.514 33.9388 37.8007V38.0226C36.0285 38.2907 37.6189 39.0166 38.71 40.2002C39.8104 41.3745 40.3559 42.8447 40.3467 44.6108C40.3559 46.2289 39.889 47.6668 38.9458 48.9243C38.0119 50.1818 36.722 51.1712 35.0761 51.8924C33.4302 52.6137 31.5439 52.9743 29.4172 52.9743Z"
          fill="url(#paint1_linear_14115_6687)"
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_14115_6687"
          x="-14.0639"
          y="-2.83434"
          width="87.1044"
          height="129.092"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6687" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="9.25047" />
          <feGaussianBlur stdDeviation="4.62523" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.07 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6687" result="effect2_dropShadow_14115_6687" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="20.5566" />
          <feGaussianBlur stdDeviation="6.16698" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6687" result="effect3_dropShadow_14115_6687" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="35.974" />
          <feGaussianBlur stdDeviation="7.19481" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6687" result="effect4_dropShadow_14115_6687" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6687" result="shape" />
        </filter>
        <filter
          id="filter1_dddd_14115_6687"
          x="14.118"
          y="22.8876"
          width="30.765"
          height="46.3672"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_14115_6687" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_14115_6687" result="effect2_dropShadow_14115_6687" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_14115_6687" result="effect3_dropShadow_14115_6687" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_14115_6687" result="effect4_dropShadow_14115_6687" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_14115_6687" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_14115_6687"
          x1="32.0814"
          y1="19.1415"
          x2="32.0814"
          y2="76.1742"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E5E5E5" />
          <stop offset="1" stopColor="#25FFC9" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_14115_6687"
          x1="23.2165"
          y1="38.0859"
          x2="38.5747"
          y2="38.0859"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#049571" />
          <stop offset="1" stopColor="#024A39" />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}

export default function TierLevel3Big({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();

  return mode === 'light' ? (
    <TierLevel3BigLight size={size} {...props} />
  ) : (
    <TierLevel3BigDark size={size} {...props} />
  );
}
