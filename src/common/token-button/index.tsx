import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import { Token } from 'common/wallet-context';
import SvgIcon from '@material-ui/core/SvgIcon';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CryptoIcons from 'assets/svg/color';

interface TokenButtonProps {
  token?: Token;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const Swap = ({ token, onClick }: TokenButtonProps) => {
  const TokenIcon = CryptoIcons[token?.symbol as keyof typeof CryptoIcons] ? (
    <SvgIcon component={CryptoIcons[token?.symbol as keyof typeof CryptoIcons]} viewBox="0 0 32 32" />
  ) : (
    <Avatar style={{ height: '18px', width: '18px' }} alt={token?.name} src={token?.logoURI} />
  );

  return (
    <Button size="small" startIcon={TokenIcon} endIcon={<ExpandMoreIcon />} onClick={onClick}>
      {token?.name}
    </Button>
  );
};
export default Swap;
