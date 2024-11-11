import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function UnlockIcon({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 24 25" style={size ? { fontSize: size } : {}} {...props}>
      <path d="M17 23.6719H7C2.59 23.6719 1.25 22.3319 1.25 17.9219V15.9219C1.25 11.5119 2.59 10.1719 7 10.1719H17C21.41 10.1719 22.75 11.5119 22.75 15.9219V17.9219C22.75 22.3319 21.41 23.6719 17 23.6719ZM7 11.6719C3.42 11.6719 2.75 12.3519 2.75 15.9219V17.9219C2.75 21.4919 3.42 22.1719 7 22.1719H17C20.58 22.1719 21.25 21.4919 21.25 17.9219V15.9219C21.25 12.3519 20.58 11.6719 17 11.6719H7Z" />
      <path d="M6 11.6719C5.59 11.6719 5.25 11.3319 5.25 10.9219V8.92188C5.25 6.02187 5.95 2.17188 12 2.17188C16.48 2.17188 18.75 4.10188 18.75 7.92188C18.75 8.33187 18.41 8.67188 18 8.67188C17.59 8.67188 17.25 8.33187 17.25 7.92188C17.25 5.94187 16.65 3.67188 12 3.67188C7.64 3.67188 6.75 5.77187 6.75 8.92188V10.9219C6.75 11.3319 6.41 11.6719 6 11.6719Z" />
      <path d="M12 20.1719C10.21 20.1719 8.75 18.7119 8.75 16.9219C8.75 15.1319 10.21 13.6719 12 13.6719C13.79 13.6719 15.25 15.1319 15.25 16.9219C15.25 18.7119 13.79 20.1719 12 20.1719ZM12 15.1719C11.04 15.1719 10.25 15.9619 10.25 16.9219C10.25 17.8819 11.04 18.6719 12 18.6719C12.96 18.6719 13.75 17.8819 13.75 16.9219C13.75 15.9619 12.96 15.1719 12 15.1719Z" />
    </CustomSvgIcon>
  );
}