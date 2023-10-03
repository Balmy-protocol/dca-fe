import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';
import { useThemeMode } from '@state/config/hooks';

interface IconProps {
  size?: string;
  fill?: string;
}

export default function ArrowRight({ size, fill }: IconProps) {
  const realSize = size || '28px';
  const mode = useThemeMode();
  const fillColor = fill || (mode === 'light' ? '#141118' : '#ffffff');
  return (
    <SvgIcon viewBox="0 0 20 13" style={{ fontSize: realSize }}>
      <path
        d="M12.9858 0.792092L12.1506 1.62833C11.9836 1.83739 11.9836 2.13007 12.1924 2.33913L15.5331 5.55864H1.16774C0.875425 5.55864 0.666626 5.80951 0.666626 6.06038V7.23111C0.666626 7.5238 0.875425 7.73286 1.16774 7.73286H15.5331L12.1924 10.9942C11.9836 11.2032 11.9836 11.4959 12.1506 11.705L12.9858 12.5412C13.1946 12.7085 13.4869 12.7085 13.6957 12.5412L19.208 7.02205C19.3751 6.81299 19.3751 6.52031 19.208 6.31125L13.6957 0.792092C13.4869 0.624845 13.1946 0.624845 12.9858 0.792092Z"
        fill={fillColor}
      />
    </SvgIcon>
  );
}
