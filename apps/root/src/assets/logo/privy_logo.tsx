import React from 'react';
import { SvgIcon } from 'ui-library';
import Privy from './privy_logo.svg';

interface PrivyLogoProps {
  size?: string;
  onClick?: () => void;
}

const PrivyLogo = ({ size, onClick }: PrivyLogoProps) => {
  const realSize = size || '28px';
  return (
    <SvgIcon
      component={Privy}
      sx={{ ...(onClick ? { cursor: 'pointer' } : {}) }}
      onClick={onClick}
      viewBox="0 0 115 115"
      fill="none"
      style={{ fontSize: realSize, fill: 'none' }}
    />
  );
};

export default PrivyLogo;
