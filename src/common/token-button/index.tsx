import React from 'react';
import Button from '@material-ui/core/Button';
import { Token } from 'common/wallet-context';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TokenIcon from 'common/token-icon';

interface TokenButtonProps {
  token?: Token;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const Swap = ({ token, onClick }: TokenButtonProps) => {
  return (
    <Button size="small" startIcon={<TokenIcon token={token} />} endIcon={<ExpandMoreIcon />} onClick={onClick}>
      {token?.symbol}
    </Button>
  );
};
export default Swap;
