import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

interface IconProps {
  size?: string;
}

export default function DottedPosition({ size }: IconProps) {
  const realSize = size || '28px';
  return (
    <SvgIcon viewBox="0 0 260 204" style={{ fontSize: realSize }}>
      <g filter="url(#filter0_d)">
        <rect x="4.5" y="2.5" width="251" height="195" rx="15.5" stroke="#D9D9D9" stroke-dasharray="16 16" />
      </g>
      <defs>
        <filter
          id="filter0_d"
          x="0"
          y="0"
          width="260"
          height="204"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </SvgIcon>
  );
}
