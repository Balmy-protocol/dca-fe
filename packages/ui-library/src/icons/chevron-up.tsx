import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function ChevronUpIcon({ size, color, ...props }: IconProps) {
  return (
    <CustomSvgIcon viewBox="0 0 18 19" {...props}>
      <path
        id="Vector"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.8791 10.5448C12.7293 10.6862 12.5311 10.765 12.3251 10.765C12.1191 10.765 11.9209 10.6862 11.7711 10.5448L8.50011 7.46382L5.23011 10.5448C5.0743 10.6919 4.86644 10.771 4.65228 10.7648C4.43811 10.7586 4.23517 10.6676 4.08811 10.5118C3.94105 10.356 3.86191 10.1482 3.8681 9.93399C3.87428 9.71982 3.9653 9.51689 4.12111 9.36982L8.50011 5.23482L12.8791 9.37082C12.9591 9.44626 13.0228 9.53724 13.0663 9.63818C13.1099 9.73912 13.1323 9.84789 13.1323 9.95782C13.1323 10.0678 13.1099 10.1765 13.0663 10.2775C13.0228 10.3784 12.9591 10.4694 12.8791 10.5448Z"
      />
    </CustomSvgIcon>
  );
}
