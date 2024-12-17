import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../components/svgicon';
import { Palette } from '@mui/material';
import { useTheme } from 'styled-components';

interface IconProps extends SvgIconProps {
  size?: string;
}

const GRADIENT_COLOR: Record<Palette['mode'], { start: string; end: string }> = {
  light: { start: '#791AFF', end: '#4A00B2' },
  dark: { start: '#07DFAA', end: '#049571' },
};

export default function TierTicketDiscountIcon({ size, ...props }: IconProps) {
  const { palette } = useTheme();
  const { start, end } = GRADIENT_COLOR[palette.mode];

  return (
    <CustomSvgIcon viewBox="0 0 25 24" style={size ? { fontSize: size } : {}} {...props}>
      <g id="vuesax/outline/ticket-discount">
        <g id="ticket-discount">
          <path
            id="Vector"
            d="M17.25 20.75H7.25C2.84 20.75 1.5 19.41 1.5 15V14.5C1.5 14.09 1.84 13.75 2.25 13.75C3.21 13.75 4 12.96 4 12C4 11.04 3.21 10.25 2.25 10.25C1.84 10.25 1.5 9.91 1.5 9.5V9C1.5 4.59 2.84 3.25 7.25 3.25H17.25C21.66 3.25 23 4.59 23 9V10C23 10.41 22.66 10.75 22.25 10.75C21.29 10.75 20.5 11.54 20.5 12.5C20.5 13.46 21.29 14.25 22.25 14.25C22.66 14.25 23 14.59 23 15C23 19.41 21.66 20.75 17.25 20.75ZM3 15.16C3.02 18.6 3.73 19.25 7.25 19.25H17.25C20.59 19.25 21.4 18.66 21.49 15.66C20.06 15.32 19 14.03 19 12.5C19 10.97 20.07 9.68 21.5 9.34V9C21.5 5.43 20.82 4.75 17.25 4.75H7.25C3.73 4.75 3.02 5.4 3 8.84C4.43 9.18 5.5 10.47 5.5 12C5.5 13.53 4.43 14.82 3 15.16Z"
            fill="url(#paint0_linear_2788_41690)"
          />
          <path
            id="Vector_2"
            d="M15.25 15.8789C14.69 15.8789 14.24 15.4289 14.24 14.8789C14.24 14.3289 14.69 13.8789 15.24 13.8789C15.79 13.8789 16.24 14.3289 16.24 14.8789C16.24 15.4289 15.81 15.8789 15.25 15.8789Z"
            fill="url(#paint1_linear_2788_41690)"
          />
          <path
            id="Vector_3"
            d="M9.24999 10.8789C8.68999 10.8789 8.23999 10.4289 8.23999 9.87891C8.23999 9.32891 8.68999 8.87891 9.23999 8.87891C9.78999 8.87891 10.24 9.32891 10.24 9.87891C10.24 10.4289 9.80999 10.8789 9.24999 10.8789Z"
            fill="url(#paint2_linear_2788_41690)"
          />
          <path
            id="Vector_4"
            d="M8.87995 16.4306C8.68995 16.4306 8.49995 16.3606 8.34995 16.2106C8.05995 15.9206 8.05995 15.4406 8.34995 15.1506L15.0799 8.42063C15.3699 8.13063 15.8499 8.13063 16.1399 8.42063C16.4299 8.71062 16.4299 9.19062 16.1399 9.48062L9.40995 16.2106C9.26995 16.3606 9.06995 16.4306 8.87995 16.4306Z"
            fill="url(#paint3_linear_2788_41690)"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_2788_41690"
          x1="6.85602"
          y1="12"
          x2="20.0646"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={start} />
          <stop offset="1" stopColor={end} />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2788_41690"
          x1="14.7382"
          y1="14.8789"
          x2="15.9669"
          y2="14.8789"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={start} />
          <stop offset="1" stopColor={end} />
        </linearGradient>
        <linearGradient
          id="paint2_linear_2788_41690"
          x1="8.73822"
          y1="9.87891"
          x2="9.96693"
          y2="9.87891"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={start} />
          <stop offset="1" stopColor={end} />
        </linearGradient>
        <linearGradient
          id="paint3_linear_2788_41690"
          x1="10.1814"
          y1="12.3169"
          x2="15.2345"
          y2="12.3169"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={start} />
          <stop offset="1" stopColor={end} />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}
