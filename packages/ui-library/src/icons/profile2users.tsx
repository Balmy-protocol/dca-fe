import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function Profile2UsersIcon({ size, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 21 21" style={size ? { fontSize: size } : {}} {...props}>
      <path
        id="Vector"
        d="M8.1849 9.86237C8.1599 9.86237 8.14323 9.86237 8.11823 9.86237C8.07656 9.85404 8.01823 9.85404 7.96823 9.86237C5.55156 9.78737 3.72656 7.88737 3.72656 5.5457C3.72656 3.16237 5.66823 1.2207 8.05156 1.2207C10.4349 1.2207 12.3766 3.16237 12.3766 5.5457C12.3682 7.88737 10.5349 9.78737 8.2099 9.86237C8.20156 9.86237 8.19323 9.86237 8.1849 9.86237ZM8.05156 2.4707C6.3599 2.4707 4.97656 3.85404 4.97656 5.5457C4.97656 7.21237 6.27656 8.55404 7.9349 8.61237C7.9849 8.60404 8.09323 8.60404 8.20156 8.61237C9.8349 8.53737 11.1182 7.1957 11.1266 5.5457C11.1266 3.85404 9.74323 2.4707 8.05156 2.4707Z"
      />
      <path
        id="Vector_2"
        d="M14.3347 9.972C14.3097 9.972 14.2847 9.972 14.2597 9.96367C13.9181 9.997 13.5681 9.75534 13.5347 9.41367C13.5014 9.072 13.7097 8.76367 14.0514 8.722C14.1514 8.71367 14.2597 8.71367 14.3514 8.71367C15.5681 8.64701 16.5181 7.64701 16.5181 6.422C16.5181 5.15534 15.4931 4.13034 14.2264 4.13034C13.8847 4.13867 13.6014 3.85534 13.6014 3.51367C13.6014 3.17201 13.8847 2.88867 14.2264 2.88867C16.1764 2.88867 17.7681 4.48034 17.7681 6.43034C17.7681 8.347 16.2681 9.89701 14.3597 9.972C14.3514 9.972 14.3431 9.972 14.3347 9.972Z"
      />
      <path
        id="Vector_3"
        d="M8.19115 18.972C6.55781 18.972 4.91615 18.5553 3.67448 17.722C2.51615 16.9553 1.88281 15.9053 1.88281 14.7637C1.88281 13.622 2.51615 12.5637 3.67448 11.7887C6.17448 10.1303 10.2245 10.1303 12.7078 11.7887C13.8578 12.5553 14.4995 13.6053 14.4995 14.747C14.4995 15.8887 13.8661 16.947 12.7078 17.722C11.4578 18.5553 9.82448 18.972 8.19115 18.972ZM4.36615 12.8387C3.56615 13.372 3.13281 14.0553 3.13281 14.772C3.13281 15.4803 3.57448 16.1637 4.36615 16.6887C6.44115 18.0803 9.94115 18.0803 12.0161 16.6887C12.8161 16.1553 13.2495 15.472 13.2495 14.7553C13.2495 14.047 12.8078 13.3637 12.0161 12.8387C9.94115 11.4553 6.44115 11.4553 4.36615 12.8387Z"
      />
      <path
        id="Vector_4"
        d="M15.8352 17.4714C15.5436 17.4714 15.2852 17.2714 15.2269 16.9714C15.1602 16.6297 15.3769 16.3047 15.7102 16.2297C16.2352 16.1214 16.7186 15.913 17.0936 15.6214C17.5686 15.263 17.8269 14.813 17.8269 14.338C17.8269 13.863 17.5686 13.413 17.1019 13.063C16.7352 12.7797 16.2769 12.5797 15.7352 12.4547C15.4019 12.3797 15.1852 12.0464 15.2602 11.7047C15.3352 11.3714 15.6686 11.1547 16.0102 11.2297C16.7269 11.388 17.3519 11.6714 17.8602 12.063C18.6352 12.6464 19.0769 13.4714 19.0769 14.338C19.0769 15.2047 18.6269 16.0297 17.8519 16.6214C17.3352 17.0214 16.6852 17.313 15.9686 17.4547C15.9186 17.4714 15.8769 17.4714 15.8352 17.4714Z"
      />
    </CustomSvgIcon>
  );
}