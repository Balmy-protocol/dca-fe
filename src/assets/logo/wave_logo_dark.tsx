import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';
import WaveLogoDark from './wave_logo_dark.svg';

interface WaveLogoDarkProps {
  size?: string;
}

const WhaveLogoDark = ({ size }: WaveLogoDarkProps) => {
  const realSize = size || '28px';
  return (
    <SvgIcon component={WaveLogoDark} viewBox="0 0 315 140" fill="none" style={{ fontSize: realSize, fill: 'none' }} />
  );
};

export default WhaveLogoDark;
