import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function MoonIcon({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 24 25" style={size ? { fontSize: size } : {}} {...props}>
      <path d="M12.4599 23.25C12.2899 23.25 12.1199 23.25 11.9499 23.24C6.34995 22.99 1.66995 18.48 1.27995 12.98C0.939948 8.25999 3.66995 3.84999 8.06995 1.99999C9.31995 1.47999 9.97995 1.87999 10.2599 2.16999C10.5399 2.44999 10.9299 3.09999 10.4099 4.28999C9.94995 5.34999 9.71995 6.47999 9.72995 7.63999C9.74995 12.07 13.4299 15.83 17.9199 16.01C18.5699 16.04 19.2099 15.99 19.8299 15.88C21.1499 15.64 21.6999 16.17 21.9099 16.51C22.1199 16.85 22.3599 17.58 21.5599 18.66C19.4399 21.56 16.0699 23.25 12.4599 23.25ZM2.76995 12.87C3.10995 17.63 7.16995 21.53 12.0099 21.74C15.2999 21.9 18.4199 20.4 20.3399 17.78C20.4899 17.57 20.5599 17.42 20.5899 17.34C20.4999 17.33 20.3399 17.32 20.0899 17.37C19.3599 17.5 18.5999 17.55 17.8499 17.52C12.5699 17.31 8.24995 12.88 8.21995 7.65999C8.21995 6.27999 8.48995 4.94999 9.03995 3.69999C9.13995 3.47999 9.15995 3.32999 9.16995 3.24999C9.07995 3.24999 8.91995 3.26999 8.65995 3.37999C4.84995 4.97999 2.48995 8.79999 2.76995 12.87Z" />
    </CustomSvgIcon>
  );
}
