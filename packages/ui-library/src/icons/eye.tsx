import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function EyeIcon({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 21 20" style={size ? { fontSize: size } : {}} {...props}>
      <path
        id="Vector"
        d="M10.3661 13.6092C8.37448 13.6092 6.75781 11.9926 6.75781 10.0009C6.75781 8.00924 8.37448 6.39258 10.3661 6.39258C12.3578 6.39258 13.9745 8.00924 13.9745 10.0009C13.9745 11.9926 12.3578 13.6092 10.3661 13.6092ZM10.3661 7.64258C9.06615 7.64258 8.00781 8.70091 8.00781 10.0009C8.00781 11.3009 9.06615 12.3592 10.3661 12.3592C11.6661 12.3592 12.7245 11.3009 12.7245 10.0009C12.7245 8.70091 11.6661 7.64258 10.3661 7.64258Z"
      />
      <path
        id="Vector_2"
        d="M10.3676 17.5177C7.23424 17.5177 4.27591 15.6844 2.24258 12.501C1.35924 11.126 1.35924 8.88437 2.24258 7.50104C4.28424 4.31771 7.24258 2.48438 10.3676 2.48438C13.4926 2.48438 16.4509 4.31771 18.4842 7.50104C19.3676 8.87604 19.3676 11.1177 18.4842 12.501C16.4509 15.6844 13.4926 17.5177 10.3676 17.5177ZM10.3676 3.73438C7.67591 3.73438 5.10091 5.35104 3.30091 8.17604C2.67591 9.15104 2.67591 10.851 3.30091 11.826C5.10091 14.651 7.67591 16.2677 10.3676 16.2677C13.0592 16.2677 15.6342 14.651 17.4342 11.826C18.0592 10.851 18.0592 9.15104 17.4342 8.17604C15.6342 5.35104 13.0592 3.73438 10.3676 3.73438Z"
      />
    </CustomSvgIcon>
  );
}
