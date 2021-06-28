import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { Token } from 'types';
import SvgIcon from '@material-ui/core/SvgIcon';
import CryptoIcons from 'assets/svg/color';

interface TokenButtonProps {
  token?: Token;
  isInChip?: boolean;
  size?: string;
}

const TokenIcon = ({ token, isInChip, size }: TokenButtonProps) => {
  const realSize = size || '28px';

  return CryptoIcons[token?.symbol as keyof typeof CryptoIcons] ? (
    <SvgIcon
      component={CryptoIcons[token?.symbol as keyof typeof CryptoIcons]}
      viewBox="0 0 32 32"
      className={isInChip ? 'MuiChip-icon' : ''}
      style={{ fontSize: realSize }}
    />
  ) : (
    <Avatar
      style={{ height: realSize, width: realSize }}
      alt={token?.name}
      src={token?.logoURI}
      className={isInChip ? 'MuiChip-avatar' : ''}
    />
  );
};

export default TokenIcon;
