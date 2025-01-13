import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../../components/svgicon';
import { Palette, useTheme } from '@mui/material';

interface IconProps extends SvgIconProps {
  size?: string;
}

const GRADIENT_COLOR: Record<Palette['mode'], { start: string; end: string }> = {
  light: { start: '#791AFF', end: '#4A00B2' },
  dark: { start: '#07DFAA', end: '#049571' },
};

export default function TierChartIcon({ size, ...props }: IconProps) {
  const { palette } = useTheme();
  const { start, end } = GRADIENT_COLOR[palette.mode];

  return (
    <CustomSvgIcon viewBox="0 0 25 24" style={size ? { fontSize: size } : {}} {...props}>
      <path
        d="M21.5 22.75H3.5C3.09 22.75 2.75 22.41 2.75 22C2.75 21.59 3.09 21.25 3.5 21.25H21.5C21.91 21.25 22.25 21.59 22.25 22C22.25 22.41 21.91 22.75 21.5 22.75Z"
        fill="url(#paint0_linear_2788_74743)"
      />
      <path
        d="M6.09998 19.7489H4.5C3.54 19.7489 2.75 18.9589 2.75 17.9989V9.37891C2.75 8.41891 3.54 7.62891 4.5 7.62891H6.09998C7.05998 7.62891 7.84998 8.41891 7.84998 9.37891V17.9989C7.84998 18.9589 7.05998 19.7489 6.09998 19.7489ZM4.5 9.1189C4.36 9.1189 4.25 9.2289 4.25 9.3689V17.9989C4.25 18.1389 4.36 18.2489 4.5 18.2489H6.09998C6.23998 18.2489 6.34998 18.1389 6.34998 17.9989V9.37891C6.34998 9.23891 6.23998 9.12891 6.09998 9.12891H4.5V9.1189Z"
        fill="url(#paint1_linear_2788_74743)"
      />
      <path
        d="M13.3002 19.7514H11.7002C10.7402 19.7514 9.9502 18.9614 9.9502 18.0014V6.19141C9.9502 5.23141 10.7402 4.44141 11.7002 4.44141H13.3002C14.2602 4.44141 15.0502 5.23141 15.0502 6.19141V18.0014C15.0502 18.9614 14.2602 19.7514 13.3002 19.7514ZM11.7002 5.94141C11.5602 5.94141 11.4502 6.05141 11.4502 6.19141V18.0014C11.4502 18.1414 11.5602 18.2514 11.7002 18.2514H13.3002C13.4402 18.2514 13.5502 18.1414 13.5502 18.0014V6.19141C13.5502 6.05141 13.4402 5.94141 13.3002 5.94141H11.7002Z"
        fill="url(#paint2_linear_2788_74743)"
      />
      <path
        d="M20.4999 19.75H18.8999C17.9399 19.75 17.1499 18.96 17.1499 18V3C17.1499 2.04 17.9399 1.25 18.8999 1.25H20.4999C21.4599 1.25 22.2499 2.04 22.2499 3V18C22.2499 18.96 21.4599 19.75 20.4999 19.75ZM18.8999 2.75C18.7599 2.75 18.6499 2.86 18.6499 3V18C18.6499 18.14 18.7599 18.25 18.8999 18.25H20.4999C20.6399 18.25 20.7499 18.14 20.7499 18V3C20.7499 2.86 20.6399 2.75 20.4999 2.75H18.8999Z"
        fill="url(#paint3_linear_2788_74743)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2788_74743"
          x1="7.60779"
          y1="22"
          x2="19.5877"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={start} />
          <stop offset="1" stopColor={end} />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2788_74743"
          x1="4.02049"
          y1="13.6889"
          x2="7.15368"
          y2="13.6889"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={start} />
          <stop offset="1" stopColor={end} />
        </linearGradient>
        <linearGradient
          id="paint2_linear_2788_74743"
          x1="11.2207"
          y1="12.0964"
          x2="14.3539"
          y2="12.0964"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={start} />
          <stop offset="1" stopColor={end} />
        </linearGradient>
        <linearGradient
          id="paint3_linear_2788_74743"
          x1="18.4204"
          y1="10.5"
          x2="21.5536"
          y2="10.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={start} />
          <stop offset="1" stopColor={end} />
        </linearGradient>
      </defs>
    </CustomSvgIcon>
  );
}
