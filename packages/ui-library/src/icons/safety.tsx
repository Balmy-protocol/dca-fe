import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';
import { useTheme } from 'styled-components';
import { colors } from '../theme';

interface IconProps extends SvgIconProps {
  size?: string;
  safety: 'low' | 'medium' | 'high';
}

export default function SafetyIcon({ size, safety, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <CustomSvgIcon viewBox="0 0 25 24" style={size ? { fontSize: size } : {}} {...props}>
      <path
        d="M21.5898 22.75H3.58984C3.17984 22.75 2.83984 22.41 2.83984 22C2.83984 21.59 3.17984 21.25 3.58984 21.25H21.5898C21.9998 21.25 22.3398 21.59 22.3398 22C22.3398 22.41 21.9998 22.75 21.5898 22.75Z"
        fill={colors[mode].semantic.success.darker}
      />
      <path
        d="M6.18982 19.7499H4.58984C3.62984 19.7499 2.83984 18.9599 2.83984 17.9999V9.37988C2.83984 8.41988 3.62984 7.62988 4.58984 7.62988H6.18982C7.14982 7.62988 7.93982 8.41988 7.93982 9.37988V17.9999C7.93982 18.9599 7.14982 19.7499 6.18982 19.7499ZM4.58984 9.11987C4.44984 9.11987 4.33984 9.22987 4.33984 9.36987V17.9999C4.33984 18.1399 4.44984 18.2499 4.58984 18.2499H6.18982C6.32982 18.2499 6.43982 18.1399 6.43982 17.9999V9.37988C6.43982 9.23988 6.32982 9.12988 6.18982 9.12988H4.58984V9.11987Z"
        fill={colors[mode].semantic.success.darker}
      />
      <path
        d="M13.39 19.7504H11.79C10.83 19.7504 10.04 18.9604 10.04 18.0004V6.19043C10.04 5.23043 10.83 4.44043 11.79 4.44043H13.39C14.35 4.44043 15.14 5.23043 15.14 6.19043V18.0004C15.14 18.9604 14.35 19.7504 13.39 19.7504ZM11.79 5.94043C11.65 5.94043 11.54 6.05043 11.54 6.19043V18.0004C11.54 18.1404 11.65 18.2504 11.79 18.2504H13.39C13.53 18.2504 13.64 18.1404 13.64 18.0004V6.19043C13.64 6.05043 13.53 5.94043 13.39 5.94043H11.79Z"
        fill={safety === 'low' ? colors[mode].typography.typo4 : colors[mode].semantic.success.darker}
      />
      <path
        d="M20.5902 19.75H18.9902C18.0302 19.75 17.2402 18.96 17.2402 18V3C17.2402 2.04 18.0302 1.25 18.9902 1.25H20.5902C21.5502 1.25 22.3402 2.04 22.3402 3V18C22.3402 18.96 21.5502 19.75 20.5902 19.75ZM18.9902 2.75C18.8502 2.75 18.7402 2.86 18.7402 3V18C18.7402 18.14 18.8502 18.25 18.9902 18.25H20.5902C20.7302 18.25 20.8402 18.14 20.8402 18V3C20.8402 2.86 20.7302 2.75 20.5902 2.75H18.9902Z"
        fill={
          safety === 'low' || safety === 'medium' ? colors[mode].typography.typo4 : colors[mode].semantic.success.darker
        }
      />
    </CustomSvgIcon>
  );
}
