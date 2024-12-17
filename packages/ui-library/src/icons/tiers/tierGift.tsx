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

export default function TierGiftIcon({ size, ...props }: IconProps) {
  const { palette } = useTheme();
  const { start, end } = GRADIENT_COLOR[palette.mode];

  return (
    <CustomSvgIcon viewBox="0 0 24 24" style={size ? { fontSize: size } : {}} {...props}>
      <g id="vuesax/outline/gift">
        <g id="gift">
          <path
            id="Vector"
            d="M15.97 22.75H7.96997C4.54997 22.75 3.21997 21.42 3.21997 18V10C3.21997 9.59 3.55997 9.25 3.96997 9.25H19.97C20.38 9.25 20.72 9.59 20.72 10V18C20.72 21.42 19.39 22.75 15.97 22.75ZM4.71997 10.75V18C4.71997 20.58 5.38997 21.25 7.96997 21.25H15.97C18.55 21.25 19.22 20.58 19.22 18V10.75H4.71997Z"
            fill="url(#paint0_linear_2788_75065)"
          />
          <path
            id="Vector_2"
            d="M19.5 10.75H4.5C2.75 10.75 1.75 9.75 1.75 8V7C1.75 5.25 2.75 4.25 4.5 4.25H19.5C21.2 4.25 22.25 5.3 22.25 7V8C22.25 9.7 21.2 10.75 19.5 10.75ZM4.5 5.75C3.59 5.75 3.25 6.09 3.25 7V8C3.25 8.91 3.59 9.25 4.5 9.25H19.5C20.38 9.25 20.75 8.88 20.75 8V7C20.75 6.12 20.38 5.75 19.5 5.75H4.5Z"
            fill="url(#paint1_linear_2788_75065)"
          />
          <path
            id="Vector_3"
            d="M11.64 5.74891H6.11997C5.90997 5.74891 5.70997 5.65891 5.56997 5.50891C4.95997 4.83891 4.97997 3.80891 5.61997 3.16891L7.03997 1.74891C7.69997 1.08891 8.78997 1.08891 9.44997 1.74891L12.17 4.46891C12.38 4.67891 12.45 5.00891 12.33 5.28891C12.22 5.56891 11.95 5.74891 11.64 5.74891ZM6.66997 4.24891H9.83997L8.38997 2.80891C8.30997 2.72891 8.17997 2.72891 8.09997 2.80891L6.67997 4.22891C6.67997 4.23891 6.66997 4.23891 6.66997 4.24891Z"
            fill="url(#paint2_linear_2788_75065)"
          />
          <path
            id="Vector_4"
            d="M17.87 5.74891H12.35C12.05 5.74891 11.77 5.56891 11.66 5.28891C11.54 5.00891 11.61 4.68891 11.82 4.46891L14.54 1.74891C15.2 1.08891 16.29 1.08891 16.95 1.74891L18.37 3.16891C19.01 3.80891 19.04 4.83891 18.42 5.50891C18.28 5.65891 18.08 5.74891 17.87 5.74891ZM14.17 4.24891H17.34C17.33 4.23891 17.33 4.23891 17.32 4.22891L15.9 2.80891C15.82 2.72891 15.69 2.72891 15.61 2.80891L14.17 4.24891Z"
            fill="url(#paint3_linear_2788_75065)"
          />
          <path
            id="Vector_5"
            d="M9.93994 16.9C9.65994 16.9 9.36994 16.83 9.10994 16.69C8.53994 16.38 8.18994 15.79 8.18994 15.15V10C8.18994 9.59 8.52994 9.25 8.93994 9.25H14.9799C15.3899 9.25 15.7299 9.59 15.7299 10V15.13C15.7299 15.78 15.3799 16.37 14.8099 16.67C14.2399 16.98 13.5499 16.94 13.0099 16.58L12.1199 15.98C12.0399 15.92 11.9299 15.92 11.8399 15.98L10.8999 16.6C10.6099 16.8 10.2699 16.9 9.93994 16.9ZM9.68994 10.75V15.14C9.68994 15.27 9.76994 15.33 9.81994 15.36C9.86994 15.39 9.96994 15.42 10.0799 15.35L11.0199 14.73C11.6099 14.34 12.3699 14.34 12.9499 14.73L13.8399 15.33C13.9499 15.4 14.0499 15.37 14.0999 15.34C14.1499 15.31 14.2299 15.25 14.2299 15.12V10.74H9.68994V10.75Z"
            fill="url(#paint4_linear_2788_75065)"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_2788_75065"
          x1="7.57952"
          y1="16"
          x2="18.3307"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={start} />
          <stop offset="1" stopColor={end} />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2788_75065"
          x1="6.8569"
          y1="7.5"
          x2="19.4511"
          y2="7.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={start} />
          <stop offset="1" stopColor={end} />
        </linearGradient>
        <linearGradient
          id="paint2_linear_2788_75065"
          x1="6.9351"
          y1="3.50141"
          x2="11.3969"
          y2="3.50141"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={start} />
          <stop offset="1" stopColor={end} />
        </linearGradient>
        <linearGradient
          id="paint3_linear_2788_75065"
          x1="13.4117"
          y1="3.50141"
          x2="17.8759"
          y2="3.50141"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={start} />
          <stop offset="1" stopColor={end} />
        </linearGradient>
        <linearGradient
          id="paint4_linear_2788_75065"
          x1="10.0683"
          y1="13.075"
          x2="14.7005"
          y2="13.075"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={start} />
          <stop offset="1" stopColor={end} />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}
