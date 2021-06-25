import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { Token } from 'types';
import SvgIcon from '@material-ui/core/SvgIcon';
import CryptoIcons from 'assets/svg/color';

interface TokenButtonProps {
  token?: Token;
  isInChip?: boolean;
}

const TokenIcon = ({ token, isInChip }: TokenButtonProps) => {
  return CryptoIcons[token?.symbol as keyof typeof CryptoIcons] ? (
    <SvgIcon
      component={CryptoIcons[token?.symbol as keyof typeof CryptoIcons]}
      viewBox="0 0 32 32"
      className={isInChip ? 'MuiChip-icon' : ''}
    />
  ) : (
    <Avatar
      style={{ height: '18px', width: '18px' }}
      alt={token?.name}
      src={token?.logoURI}
      className={isInChip ? 'MuiChip-avatar' : ''}
    />
  );
};

export default TokenIcon;
