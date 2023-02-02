import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';
import WaveLogoDark from './wave_logo_dark.svg';

interface WaveLogoDarkProps {
  size?: string;
  onClick?: () => void;
}

const WhaveLogoDark = ({ size, onClick }: WaveLogoDarkProps) => {
  const realSize = size || '28px';
  return (
    <SvgIcon
      component={WaveLogoDark}
      sx={{ ...(onClick ? { cursor: 'pointer' } : {}) }}
      onClick={onClick}
      viewBox="0 0 315 140"
      fill="none"
      style={{ fontSize: realSize, fill: 'none' }}
    />
  );
};

export default WhaveLogoDark;
