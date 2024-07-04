import React from 'react';
import styled from 'styled-components';
import { Token } from '@types';
import { SvgIcon, useTheme, colors } from 'ui-library';
import CryptoIcons from '@assets/svg/color';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useTokenListUnfiltered from '@hooks/useTokenFromList';

const StyledEmptyTokenIcon = styled.div<{ $realSize: string }>`
  ${({
    $realSize,
    theme: {
      palette: { mode },
    },
  }) => `
  width: ${$realSize};
  height: ${$realSize};
  background-color: ${mode === 'light' ? colors[mode].background.primary : colors[mode].background.secondary};
  border-radius: 50%;
  `};
`;
export interface TokenIconProps {
  token?: Token;
  isInChip?: boolean;
  size?: number;
  withShadow?: boolean;
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

const TokenIcon = ({ token, isInChip, size = 7, withShadow }: TokenIconProps) => {
  const { spacing, palette } = useTheme();
  const realSize = spacing(size);
  const [hasError, setHasError] = React.useState(false);
  let componentToRender = null;
  const foundToken = useTokenListUnfiltered(token?.address, true);
  const tokenLogoUri = token?.logoURI || (token && foundToken && foundToken.logoURI);
  const addressToUse =
    token?.address && (token.address === PROTOCOL_TOKEN_ADDRESS ? `${token.chainId}-${token.address}` : token.address);
  const boxShadow = withShadow ? colors[palette.mode].dropShadow.dropShadow100 : 'none';

  if (CryptoIcons[addressToUse as keyof typeof CryptoIcons]) {
    componentToRender = (
      <SvgIcon
        component={CryptoIcons[addressToUse as keyof typeof CryptoIcons]}
        viewBox="0 0 32 32"
        className={isInChip ? 'MuiChip-icon' : ''}
        style={{ fontSize: realSize, boxShadow }}
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
        style={{ borderRadius: '50%', boxShadow }}
        className={isInChip ? 'MuiChip-icon' : ''}
      />
    );
  } else {
    componentToRender = <StyledEmptyTokenIcon $realSize={realSize} className={isInChip ? 'MuiChip-icon' : ''} />;
  }

  return componentToRender;
};

export default TokenIcon;
