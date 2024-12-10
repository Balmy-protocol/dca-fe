import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function TierLevel0Active({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 20 19" style={size ? { fontSize: size } : {}} {...props}>
      <g filter="url(#filter0_dddd_2750_122200)">
        <path
          d="M3.83455 3.52778C3.83455 3.35661 3.94948 3.20677 4.11481 3.16241L9.90196 1.60954C9.96618 1.5923 10.0338 1.5923 10.098 1.60954L15.8852 3.16241C16.0505 3.20677 16.1655 3.35661 16.1655 3.52778V15.9801C16.1655 16.1542 16.0467 16.3058 15.8777 16.3474L10.0905 17.7733L10.1377 17.9649L10.0905 17.7733C10.0311 17.7879 9.96895 17.7879 9.9095 17.7733L9.86229 17.9649L9.9095 17.7733L4.12235 16.3474C3.95333 16.3058 3.83455 16.1542 3.83455 15.9801V3.52778Z"
          stroke="#F9F7FC"
          strokeWidth="0.394683"
        />
      </g>
      <path
        d="M4.13721 2.05713C4.13721 2.01048 4.17503 1.97266 4.22168 1.97266H10H15.7783C15.825 1.97266 15.8628 2.01048 15.8628 2.05713V17.5081C15.8628 17.5547 15.825 17.5926 15.7783 17.5926H10H4.22168C4.17503 17.5926 4.13721 17.5547 4.13721 17.5081V2.05713Z"
        fill="#F8D5BA"
        stroke="url(#paint0_linear_2750_122200)"
      />
      <g filter="url(#filter1_dddd_2750_122200)">
        <path
          d="M9.99856 13.4411C9.38776 13.4387 8.8622 13.2884 8.42185 12.9901C7.98388 12.6918 7.64652 12.2597 7.40978 11.6939C7.17541 11.1281 7.0594 10.4474 7.06177 9.65199C7.06177 8.8589 7.17896 8.183 7.41333 7.62429C7.65007 7.06558 7.98743 6.64062 8.42541 6.34943C8.86575 6.05587 9.39013 5.90909 9.99856 5.90909C10.607 5.90909 11.1302 6.05587 11.5682 6.34943C12.0085 6.64299 12.347 7.06913 12.5838 7.62784C12.8205 8.18419 12.9377 8.8589 12.9353 9.65199C12.9353 10.4498 12.817 11.1316 12.5802 11.6974C12.3459 12.2633 12.0097 12.6953 11.5717 12.9936C11.1337 13.2919 10.6094 13.4411 9.99856 13.4411ZM9.99856 12.1662C10.4152 12.1662 10.7478 11.9567 10.9964 11.5376C11.245 11.1186 11.3681 10.4901 11.3657 9.65199C11.3657 9.10038 11.3089 8.6411 11.1953 8.27415C11.084 7.9072 10.9254 7.63139 10.7194 7.44673C10.5158 7.26207 10.2755 7.16974 9.99856 7.16974C9.58426 7.16974 9.25282 7.37689 9.00424 7.79119C8.75566 8.20549 8.63019 8.82576 8.62782 9.65199C8.62782 10.2107 8.68345 10.6771 8.79472 11.0511C8.90836 11.4228 9.06816 11.7022 9.27413 11.8892C9.48009 12.0739 9.72157 12.1662 9.99856 12.1662Z"
          fill="#6C3C05"
        />
      </g>
      <defs>
        <filter
          id="filter0_dddd_2750_122200"
          x="0.497639"
          y="0.725673"
          width="19.0047"
          height="28.2433"
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
          <feOffset dy="0.44851" />
          <feGaussianBlur stdDeviation="0.560637" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.08 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2750_122200" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.01829" />
          <feGaussianBlur stdDeviation="1.00915" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.07 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_2750_122200" result="effect2_dropShadow_2750_122200" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4.4851" />
          <feGaussianBlur stdDeviation="1.34553" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_2750_122200" result="effect3_dropShadow_2750_122200" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="7.84892" />
          <feGaussianBlur stdDeviation="1.56978" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_2750_122200" result="effect4_dropShadow_2750_122200" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_2750_122200" result="shape" />
        </filter>
        <filter
          id="filter1_dddd_2750_122200"
          x="2.53572"
          y="5.00568"
          width="14.9256"
          height="24.7163"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2750_122200" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2.71343" />
          <feGaussianBlur stdDeviation="1.35672" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_2750_122200" result="effect2_dropShadow_2750_122200" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6.33134" />
          <feGaussianBlur stdDeviation="1.80895" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_2750_122200" result="effect3_dropShadow_2750_122200" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="11.7582" />
          <feGaussianBlur stdDeviation="2.26119" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.0470588 0 0 0 0 0.372549 0 0 0 0.01 0" />
          <feBlend mode="normal" in2="effect3_dropShadow_2750_122200" result="effect4_dropShadow_2750_122200" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_2750_122200" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_2750_122200"
          x1="6.80737"
          y1="9.78261"
          x2="14.6254"
          y2="9.78261"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A35B30" />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}
