import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';
import WaveLogoDark from './wave_logo_dark.svg';

interface WaveLogoDarkProps {
  size?: string;
}

const WhaveLogoDark = ({ size }: WaveLogoDarkProps) => {
  const realSize = size || '28px';
  return <SvgIcon component={WaveLogoDark} viewBox="1812.9 1510.96 334.49 158.84" style={{ fontSize: realSize }} />;
};

export default WhaveLogoDark;
