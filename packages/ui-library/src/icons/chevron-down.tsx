import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function ChevronDownIcon({ size, color, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 16 16" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.12089 5.45518C3.27068 5.31376 3.46889 5.23498 3.67489 5.23498C3.88089 5.23498 4.0791 5.31376 4.22889 5.45518L7.49989 8.53618L10.7699 5.45518C10.9257 5.30812 11.1336 5.22897 11.3477 5.23516C11.5619 5.24135 11.7648 5.33236 11.9119 5.48818C12.059 5.64399 12.1381 5.85185 12.1319 6.06601C12.1257 6.28018 12.0347 6.48312 11.8789 6.63018L7.49989 10.7652L3.12089 6.62918C3.04093 6.55374 2.97722 6.46276 2.93368 6.36182C2.89014 6.26088 2.86768 6.15211 2.86768 6.04218C2.86768 5.93225 2.89014 5.82348 2.93368 5.72254C2.97722 5.6216 3.04093 5.53062 3.12089 5.45518Z"
      />
    </CustomSvgIcon>
  );
}
