import { SvgIconProps } from '@mui/material';
import React from 'react';
import { useTheme } from 'styled-components';
import { CustomSvgIcon } from '../components';
import { colors } from '../theme';

interface IconProps extends SvgIconProps {
  size?: string;
}
export default function GalxeLogoMinimalistic({ size, height, width, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <CustomSvgIcon viewBox="0 0 621 450" fill="none" style={{ fontSize: size, height, width }} {...props}>
      <path
        d="M614.888 78.841C610.85 70.7607 603.899 64.7338 595.331 61.8728C586.763 59.0119 577.586 59.6635 569.505 63.7015L569.306 63.7958L0.001008 421.284L599.736 124.223C607.816 120.185 613.843 113.234 616.704 104.666C619.565 96.0977 618.913 86.9207 614.875 78.8404L614.888 78.841Z"
        fill={colors[mode].violet.violet200}
      />
      <path
        d="M446.385 77.2371C458.686 71.5687 464.137 56.9582 458.525 44.6096C452.89 32.2202 438.244 26.7272 425.842 32.3481L425.491 32.5004L56.1522 295.663L446.385 77.2371Z"
        fill={colors[mode].violet.violet200}
      />
      <path
        d="M467.788 295.721C477.705 290.707 481.722 278.574 476.749 268.62C471.764 258.639 459.582 254.568 449.601 259.566L449.322 259.709L211.841 398.558L467.788 295.734L467.788 295.721Z"
        fill={colors[mode].violet.violet200}
      />
    </CustomSvgIcon>
  );
}
