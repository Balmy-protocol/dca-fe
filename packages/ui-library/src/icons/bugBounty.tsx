import React from 'react';
import { SvgIcon } from '../components/svgicon';

interface IconProps {
  size?: string;
}

export default function BugBountyIcon({ size }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 25 25" style={size ? { fontSize: size } : {}}>
      <path
        d="M19.0703 15.25V12.188C19.0703 11.1438 18.6556 10.1423 17.9173 9.40377C17.179 8.66528 16.1776 8.25027 15.1333 8.25H9.00631C7.96224 8.25053 6.9611 8.66566 6.22302 9.40412C5.48493 10.1426 5.07031 11.1439 5.07031 12.188V15.25C5.07031 16.1693 5.25137 17.0795 5.60316 17.9288C5.95494 18.7781 6.47055 19.5497 7.12056 20.1997C7.77058 20.8498 8.54225 21.3654 9.39153 21.7172C10.2408 22.0689 11.1511 22.25 12.0703 22.25C12.9896 22.25 13.8998 22.0689 14.7491 21.7172C15.5984 21.3654 16.37 20.8498 17.0201 20.1997C17.6701 19.5497 18.1857 18.7781 18.5375 17.9288C18.8893 17.0795 19.0703 16.1693 19.0703 15.25Z"
        stroke="black"
        strokeWidth="1.5"
      />
      <path
        d="M16.5703 8.75V7.75C16.5703 6.55653 16.0962 5.41193 15.2523 4.56802C14.4084 3.72411 13.2638 3.25 12.0703 3.25C10.8768 3.25 9.73225 3.72411 8.88833 4.56802C8.04442 5.41193 7.57031 6.55653 7.57031 7.75V8.75"
        stroke="black"
        strokeWidth="1.5"
      />
      <path
        d="M19.0703 14.25H22.0703M5.07031 14.25H2.07031M14.5703 3.75L17.0703 2.25M9.57031 3.75L7.07031 2.25M20.5703 20.25L18.5703 19.45M20.5703 8.25L18.5703 9.05M3.57031 20.25L5.57031 19.45M3.57031 8.25L5.57031 9.05M12.0703 21.75V15.25"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </SvgIcon>
  );
}
