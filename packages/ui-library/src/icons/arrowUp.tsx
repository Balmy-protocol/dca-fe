import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';
import { useTheme } from 'styled-components';
import { colors } from '../theme';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function ArrowUpIcon({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <CustomSvgIcon viewBox="0 0 25 25" style={size ? { fontSize: size } : {}} {...props}>
      <g id="vuesax/outline/arrow-up">
        <g id="arrow-up">
          <path
            id="Vector"
            d="M20.0445 16.1653C19.8545 16.1653 19.6645 16.0953 19.5145 15.9453L12.9945 9.42531C12.5145 8.94531 11.7345 8.94531 11.2545 9.42531L4.73453 15.9453C4.44453 16.2353 3.96453 16.2353 3.67453 15.9453C3.38453 15.6553 3.38453 15.1753 3.67453 14.8853L10.1945 8.36531C11.2545 7.30531 12.9845 7.30531 14.0545 8.36531L20.5745 14.8853C20.8645 15.1753 20.8645 15.6553 20.5745 15.9453C20.4245 16.0853 20.2345 16.1653 20.0445 16.1653Z"
            fill={colors[mode].typography.typo3}
          />
        </g>
      </g>
    </CustomSvgIcon>
  );
}
