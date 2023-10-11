import React from 'react';
import { SvgIcon } from 'ui-library';
import BlowfishLogoRaw from './poweredby_blk.svg';

interface BlowfishLogoProps {
  size?: string;
}

const BlowfishLogo = ({ size }: BlowfishLogoProps) => {
  const realSize = size || '120px';
  return (
    <SvgIcon
      component={BlowfishLogoRaw}
      viewBox="0 0 354 50"
      fill="none"
      style={{ fontSize: realSize, fill: 'none', height: '20px' }}
    />
  );
};

export default BlowfishLogo;
