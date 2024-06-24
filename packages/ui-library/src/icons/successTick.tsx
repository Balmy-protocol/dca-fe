import React from 'react';
import { CustomSvgIcon, SvgIconProps } from '../components/svgicon';
import { useTheme } from 'styled-components';
import { colors } from '../theme';

interface IconProps extends SvgIconProps {
  size?: string;
}

export default function SuccessTickIcon({ size, ...props }: IconProps) {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <CustomSvgIcon viewBox="0 0 26 19" style={size ? { fontSize: size } : {}} {...props}>
      <path
        d="M9.82106 18.8765C9.32159 18.8765 8.84709 18.6767 8.49746 18.327L1.4299 11.2595C0.705659 10.5352 0.705659 9.33651 1.4299 8.61227C2.15413 7.88804 3.35287 7.88804 4.07711 8.61227L9.82106 14.3562L22.6575 1.51974C23.3818 0.795503 24.5805 0.795503 25.3048 1.51974C26.029 2.24398 26.029 3.44271 25.3048 4.16695L11.1447 18.327C10.795 18.6767 10.3205 18.8765 9.82106 18.8765Z"
        fill={colors[mode].semantic.success.primary}
      />
    </CustomSvgIcon>
  );
}
