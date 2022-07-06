import React from 'react';
import styled from 'styled-components';
import { Token } from 'types';
import SvgIcon from '@mui/material/SvgIcon';
import CryptoIcons from 'assets/svg/color';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import useTokenListUnfiltered from 'hooks/useTokenFromList';

const StyledHelpOutlineIcon = styled(HelpOutlineOutlinedIcon)<{ realSize: string }>`
  font-size: ${({ realSize }) => realSize};
`;
interface TokenButtonProps {
  token?: Token;
  isInChip?: boolean;
  size?: string;
}

function getLogoURL(logoURI: string) {
  if (logoURI?.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${logoURI.split('//')[1]}`;
  }
  if (typeof logoURI === 'string') {
    return logoURI;
  }
  return '';
}

const TokenIcon = ({ token, isInChip, size }: TokenButtonProps) => {
  const realSize = size || '28px';
  const [hasError, setHasError] = React.useState(false);
  let componentToRender = null;
  const foundToken = useTokenListUnfiltered(token?.address);
  const tokenLogoUri = token?.logoURI || (token && foundToken && foundToken.logoURI);
  const addressToUse =
    token?.address && (token.address === PROTOCOL_TOKEN_ADDRESS ? `${token.chainId}-${token.address}` : token.address);

  if (CryptoIcons[addressToUse as keyof typeof CryptoIcons]) {
    componentToRender = (
      <SvgIcon
        component={CryptoIcons[addressToUse as keyof typeof CryptoIcons]}
        viewBox="0 0 32 32"
        className={isInChip ? 'MuiChip-icon' : ''}
        style={{ fontSize: realSize }}
      />
    );
  } else if (tokenLogoUri && !hasError) {
    componentToRender = (
      <img
        src={getLogoURL(tokenLogoUri)}
        onError={() => setHasError(true)}
        height={realSize}
        width={realSize}
        alt={token?.symbol}
      />
    );
  } else {
    componentToRender = <StyledHelpOutlineIcon realSize={realSize} className={isInChip ? 'MuiChip-icon' : ''} />;
  }

  return componentToRender;
};

export default TokenIcon;
