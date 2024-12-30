import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function PenAddIcon({ size, color, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 20 20" sx={{ fontSize: size }} {...props}>
      <path d="M15.2087 11.85C15.0503 11.85 14.8837 11.7833 14.767 11.6667L10.042 6.94167C9.83368 6.73334 9.80034 6.41668 9.95868 6.16668L11.4337 3.8333C11.8337 3.19164 12.4587 2.8 13.1753 2.71667C13.967 2.625 14.8087 2.95 15.4587 3.6L18.1087 6.24999C18.7337 6.87499 19.042 7.70832 18.9504 8.54166C18.867 9.26666 18.4837 9.89162 17.8837 10.275L15.5504 11.75C15.442 11.8166 15.3253 11.85 15.2087 11.85ZM11.2837 6.41667L15.3003 10.4333L17.2087 9.225C17.492 9.05 17.667 8.75835 17.7004 8.40835C17.7504 7.96668 17.567 7.49166 17.217 7.14166L14.567 4.49167C14.1837 4.10834 13.7253 3.91667 13.3087 3.96667C12.9753 4 12.692 4.19163 12.492 4.5083L11.2837 6.41667Z" />
      <path d="M5.52507 18.9584C4.74173 18.9584 4.05007 18.6834 3.5334 18.1667C2.9334 17.5667 2.66673 16.725 2.77506 15.7916L3.59173 8.89167C3.63339 8.55 3.94173 8.30836 4.2834 8.34169C4.62506 8.38336 4.87507 8.69171 4.8334 9.03337L4.01674 15.9333C3.95007 16.475 4.09173 16.95 4.41673 17.275C4.74173 17.6 5.22506 17.75 5.77506 17.6833L13.0417 16.825C14.5917 16.6416 14.9334 16.225 14.7834 14.7084L14.5834 11.25C14.5667 10.9084 14.8251 10.6083 15.1751 10.5917C15.5167 10.575 15.8167 10.8334 15.8334 11.1834L16.0334 14.6167C16.2501 16.7667 15.4001 17.8083 13.1917 18.075L5.92506 18.9333C5.79173 18.95 5.6584 18.9584 5.52507 18.9584Z" />
      <path d="M10.4834 7.13333C10.4667 7.13333 10.4584 7.13333 10.4417 7.13333L8.98339 7.04168C8.64173 7.01668 8.37506 6.72502 8.40006 6.37502C8.42506 6.02502 8.71673 5.76668 9.06673 5.79168L10.5251 5.88333C10.8667 5.90833 11.1334 6.19999 11.1084 6.54999C11.0834 6.87499 10.8084 7.13333 10.4834 7.13333Z" />
      <path d="M4.40026 17.9417C4.24193 17.9417 4.08359 17.8833 3.95859 17.7583C3.71693 17.5167 3.71693 17.1166 3.95859 16.875L6.60859 14.2249C6.85025 13.9833 7.25027 13.9833 7.49193 14.2249C7.7336 14.4666 7.7336 14.8666 7.49193 15.1083L4.84193 17.7583C4.71693 17.8833 4.55859 17.9417 4.40026 17.9417Z" />
      <path d="M5.4165 9.79166C4.92484 9.79166 4.44984 9.7083 4.00817 9.5583C3.0415 9.2333 2.20817 8.56667 1.67483 7.67501C1.25817 6.99167 1.0415 6.20832 1.0415 5.41666C1.0415 4.06666 1.6415 2.82501 2.6915 2.00001C3.45817 1.38334 4.42484 1.04166 5.4165 1.04166C7.83317 1.04166 9.7915 3.00832 9.7915 5.41666C9.7915 5.80832 9.73317 6.21663 9.62484 6.59163C9.51651 6.97497 9.36651 7.32501 9.15817 7.67501C8.91651 8.07501 8.62484 8.41667 8.28317 8.70833C7.49984 9.40833 6.48317 9.79166 5.4165 9.79166ZM5.4165 2.29166C4.70817 2.29166 4.01651 2.53333 3.46651 2.975C2.71651 3.56666 2.2915 4.44999 2.2915 5.41666C2.2915 5.97499 2.44983 6.53332 2.7415 7.02498C3.12483 7.65832 3.7165 8.14164 4.40816 8.36664C5.4165 8.72497 6.62484 8.49999 7.46651 7.75832C7.70818 7.54999 7.91651 7.29998 8.09151 7.02498C8.24151 6.77498 8.34984 6.52499 8.42484 6.24999C8.49984 5.97499 8.5415 5.69166 8.5415 5.41666C8.5415 3.69166 7.1415 2.29166 5.4165 2.29166Z" />
      <path d="M5.43359 7.44171C5.09193 7.44171 4.80859 7.15838 4.80859 6.81671V4.01672C4.80859 3.67506 5.09193 3.39172 5.43359 3.39172C5.77526 3.39172 6.05859 3.67506 6.05859 4.01672V6.81671C6.05859 7.16671 5.77526 7.44171 5.43359 7.44171Z" />
      <path d="M6.8 6.04166H4C3.65833 6.04166 3.375 5.75832 3.375 5.41666C3.375 5.07499 3.65833 4.79166 4 4.79166H6.8C7.14167 4.79166 7.425 5.07499 7.425 5.41666C7.425 5.75832 7.15 6.04166 6.8 6.04166Z" />
    </CustomSvgIcon>
  );
}