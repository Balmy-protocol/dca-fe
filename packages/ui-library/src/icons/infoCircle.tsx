import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';
import { colors } from '../theme';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function InfoCircleIcon({ size, color, ...props }: IconProps) {
  return (
    <CustomSvgIcon
      viewBox="0 0 18 19"
      sx={({ palette }) => ({ fontSize: size, color: color || colors[palette.mode].typography.typo4 })}
      {...props}
    >
      <path d="M9 1.08984C13.4475 1.08984 17.0625 4.70484 17.0625 9.15234C17.0625 13.5998 13.4475 17.2148 9 17.2148C4.5525 17.2148 0.9375 13.5998 0.937501 9.15234C0.937501 4.70484 4.5525 1.08984 9 1.08984ZM9 16.0898C12.825 16.0898 15.9375 12.9773 15.9375 9.15234C15.9375 5.32734 12.825 2.21484 9 2.21484C5.175 2.21484 2.0625 5.32734 2.0625 9.15234C2.0625 12.9773 5.175 16.0898 9 16.0898Z" />
      <path d="M9 7.83984C9.3075 7.83984 9.5625 8.09484 9.5625 8.40234L9.5625 12.1523C9.5625 12.4598 9.3075 12.7148 9 12.7148C8.6925 12.7148 8.4375 12.4598 8.4375 12.1523L8.4375 8.40234C8.4375 8.09484 8.6925 7.83984 9 7.83984Z" />
      <path d="M9 5.40219C9.0975 5.40219 9.195 5.42469 9.285 5.46219C9.375 5.49969 9.4575 5.55219 9.5325 5.61969C9.6 5.69469 9.6525 5.76969 9.69 5.86719C9.7275 5.95719 9.75 6.05469 9.75 6.15219C9.75 6.24969 9.7275 6.34719 9.69 6.43719C9.6525 6.52719 9.6 6.60969 9.5325 6.68469C9.4575 6.75219 9.375 6.80469 9.285 6.84219C9.105 6.91719 8.895 6.91719 8.715 6.84219C8.625 6.80469 8.5425 6.75219 8.4675 6.68469C8.4 6.60969 8.3475 6.52719 8.31 6.43719C8.2725 6.34719 8.25 6.24969 8.25 6.15219C8.25 6.05469 8.2725 5.95719 8.31 5.86719C8.3475 5.76969 8.4 5.69469 8.4675 5.61969C8.5425 5.55219 8.625 5.49969 8.715 5.46219C8.805 5.42469 8.9025 5.40219 9 5.40219Z" />
    </CustomSvgIcon>
  );
}
