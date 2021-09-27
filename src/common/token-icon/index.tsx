import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { Token } from 'types';
import SvgIcon from '@material-ui/core/SvgIcon';
import CryptoIcons from 'assets/svg/color';
import HelpIcon from '@material-ui/icons/Help';

interface TokenButtonProps {
  token?: Token;
  isInChip?: boolean;
  size?: string;
}

const TokenIcon = ({ token, isInChip, size }: TokenButtonProps) => {
  const realSize = size || '28px';
  const [hasError, setHasError] = React.useState(false);
  let componentToRender = null;

  if (CryptoIcons[token?.address as keyof typeof CryptoIcons]) {
    componentToRender = (
      <SvgIcon
        component={CryptoIcons[token?.address as keyof typeof CryptoIcons]}
        viewBox="0 0 32 32"
        className={isInChip ? 'MuiChip-icon' : ''}
        style={{ fontSize: realSize }}
      />
    );
  } else if (token?.logoURI && !hasError) {
    componentToRender = (
      <img src={token.logoURI} onError={() => setHasError(true)} height={realSize} width={realSize} />
    );
  } else {
    componentToRender = <HelpIcon style={{ fontSize: realSize }} className={isInChip ? 'MuiChip-icon' : ''} />;
  }

  return componentToRender;
};

export default TokenIcon;
