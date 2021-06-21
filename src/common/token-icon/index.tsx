import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { Token } from 'common/wallet-context';
import SvgIcon from '@material-ui/core/SvgIcon';
import CryptoIcons from 'assets/svg/color';

interface TokenButtonProps {
  token?: Token;
}

const TokenIcon = ({ token }: TokenButtonProps) => {
  console.log(token);
  return CryptoIcons[token?.symbol as keyof typeof CryptoIcons] ? (
    <SvgIcon component={CryptoIcons[token?.symbol as keyof typeof CryptoIcons]} viewBox="0 0 32 32" />
  ) : (
    <Avatar style={{ height: '18px', width: '18px' }} alt={token?.name} src={token?.logoURI} />
  );
};

export default TokenIcon;
