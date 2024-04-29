import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function AddEmptyWalletIcon({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 19 18" style={size ? { fontSize: size } : {}} {...props}>
      <path d="M13.6722 17.0625H5.06219C3.19469 17.0625 1.67969 15.5475 1.67969 13.68V8.63251C1.67969 6.76501 3.19469 5.25 5.06219 5.25H13.6722C15.5397 5.25 17.0547 6.76501 17.0547 8.63251V9.71251C17.0547 10.02 16.7997 10.275 16.4922 10.275H14.9772C14.7147 10.275 14.4747 10.3725 14.3022 10.5525L14.2947 10.56C14.0847 10.7625 13.9872 11.04 14.0097 11.325C14.0547 11.82 14.5272 12.2175 15.0672 12.2175H16.4922C16.7997 12.2175 17.0547 12.4725 17.0547 12.78V13.6725C17.0547 15.5475 15.5397 17.0625 13.6722 17.0625ZM5.06219 6.375C3.81719 6.375 2.80469 7.38751 2.80469 8.63251V13.68C2.80469 14.925 3.81719 15.9375 5.06219 15.9375H13.6722C14.9172 15.9375 15.9297 14.925 15.9297 13.68V13.35H15.0672C13.9347 13.35 12.9747 12.51 12.8847 11.43C12.8247 10.815 13.0497 10.2075 13.4997 9.76501C13.8897 9.36751 14.4147 9.15001 14.9772 9.15001H15.9297V8.63251C15.9297 7.38751 14.9172 6.375 13.6722 6.375H5.06219Z" />
      <path d="M2.24219 9.87C1.93469 9.87 1.67969 9.615 1.67969 9.3075V5.88005C1.67969 4.76255 2.38469 3.75 3.42719 3.3525L9.38219 1.1025C9.99719 0.870004 10.6797 0.952541 11.2122 1.32754C11.7522 1.70254 12.0672 2.31003 12.0672 2.96253V5.81253C12.0672 6.12003 11.8122 6.37503 11.5047 6.37503C11.1972 6.37503 10.9422 6.12003 10.9422 5.81253V2.96253C10.9422 2.67753 10.8072 2.41503 10.5672 2.25003C10.3272 2.08503 10.0422 2.04752 9.77219 2.15252L3.81719 4.40252C3.20969 4.63502 2.79719 5.22755 2.79719 5.88005V9.3075C2.80469 9.62251 2.54969 9.87 2.24219 9.87Z" />
      <path d="M15.067 13.3484C13.9345 13.3484 12.9745 12.5084 12.8845 11.4284C12.8245 10.8059 13.0495 10.1984 13.4995 9.75594C13.882 9.36594 14.407 9.14844 14.9695 9.14844H16.5295C17.272 9.17094 17.842 9.75591 17.842 10.4759V12.021C17.842 12.741 17.272 13.3259 16.552 13.3484H15.067ZM16.5145 10.2734H14.977C14.7145 10.2734 14.4745 10.3709 14.302 10.5509C14.0845 10.7609 13.9795 11.0459 14.0095 11.3309C14.0545 11.8259 14.527 12.2234 15.067 12.2234H16.537C16.6345 12.2234 16.7245 12.1335 16.7245 12.021V10.4759C16.7245 10.3634 16.6345 10.2809 16.5145 10.2734Z" />
      <path d="M10.8672 9.5625H5.61719C5.30969 9.5625 5.05469 9.3075 5.05469 9C5.05469 8.6925 5.30969 8.4375 5.61719 8.4375H10.8672C11.1747 8.4375 11.4297 8.6925 11.4297 9C11.4297 9.3075 11.1747 9.5625 10.8672 9.5625Z" />
    </CustomSvgIcon>
  );
}
