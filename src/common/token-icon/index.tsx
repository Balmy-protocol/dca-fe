import React from 'react';
import { Token } from 'types';
import SvgIcon from '@material-ui/core/SvgIcon';
import CryptoIcons from 'assets/svg/color';
import HelpIcon from '@material-ui/icons/Help';
import useTokenList from 'hooks/useTokenList';

interface TokenButtonProps {
  token?: Token;
  isInChip?: boolean;
  size?: string;
}

const TokenIcon = ({ token, isInChip, size }: TokenButtonProps) => {
  const realSize = size || '28px';
  const [hasError, setHasError] = React.useState(false);
  let componentToRender = null;
  const tokenList = useTokenList();
  const tokenLogoUri = token?.logoURI || (token && tokenList[token.address] && tokenList[token.address].logoURI);

  if (CryptoIcons[token?.address as keyof typeof CryptoIcons]) {
    componentToRender = (
      <SvgIcon
        component={CryptoIcons[token?.address as keyof typeof CryptoIcons]}
        viewBox="0 0 32 32"
        className={isInChip ? 'MuiChip-icon' : ''}
        style={{ fontSize: realSize }}
      />
    );
  } else if (tokenLogoUri && !hasError) {
    componentToRender = (
      <img
        src={tokenLogoUri}
        onError={() => setHasError(true)}
        height={realSize}
        width={realSize}
        alt={token?.symbol}
      />
    );
  } else {
    componentToRender = <HelpIcon style={{ fontSize: realSize }} className={isInChip ? 'MuiChip-icon' : ''} />;
  }

  return componentToRender;
};

export default TokenIcon;
