import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function ClockIcon({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 24 25" style={size ? { fontSize: size } : {}} {...props}>
      <path
        id="Vector"
        d="M12 23.25C6.07 23.25 1.25 18.43 1.25 12.5C1.25 6.57 6.07 1.75 12 1.75C17.93 1.75 22.75 6.57 22.75 12.5C22.75 18.43 17.93 23.25 12 23.25ZM12 3.25C6.9 3.25 2.75 7.4 2.75 12.5C2.75 17.6 6.9 21.75 12 21.75C17.1 21.75 21.25 17.6 21.25 12.5C21.25 7.4 17.1 3.25 12 3.25Z"
      />
      <path
        id="Vector_2"
        d="M15.71 16.43C15.58 16.43 15.45 16.4 15.33 16.32L12.23 14.47C11.46 14.01 10.89 13 10.89 12.11V8.00999C10.89 7.59999 11.23 7.25999 11.64 7.25999C12.05 7.25999 12.39 7.59999 12.39 8.00999V12.11C12.39 12.47 12.69 13 13 13.18L16.1 15.03C16.46 15.24 16.57 15.7 16.36 16.06C16.21 16.3 15.96 16.43 15.71 16.43Z"
      />
    </CustomSvgIcon>
  );
}
