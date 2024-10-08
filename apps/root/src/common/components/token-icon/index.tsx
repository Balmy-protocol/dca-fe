import React from 'react';
import styled from 'styled-components';
import { Token } from '@types';
import { SvgIcon, useTheme, colors, ContainerBox } from 'ui-library';
import CryptoIcons from '@assets/svg/color';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useTokenListUnfiltered from '@hooks/useTokenFromList';
import { getLogoURL } from '@common/utils/urlParser';

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

const StyledTokenIconContainer = styled(ContainerBox)`
  border: 1px solid ${({ theme }) => colors[theme.palette.mode].border.border1};
  border-radius: 50%;
`;

export interface TokenIconProps {
  token?: Token;
  isInChip?: boolean;
  size?: number;
  withShadow?: boolean;
  shadowType?: keyof (typeof colors)[keyof typeof colors]['dropShadow'];
  border?: boolean;
}

const TokenIcon = ({ token, isInChip, size = 7, withShadow, shadowType = 'dropShadow100', border }: TokenIconProps) => {
  const { spacing, palette } = useTheme();
  const realSize = spacing(size);
  const [hasError, setHasError] = React.useState(false);
  let componentToRender = null;
  const foundToken = useTokenListUnfiltered({ tokenAddress: token?.address, chainId: token?.chainId }, true);
  const tokenLogoUri = token?.logoURI || (token && foundToken && foundToken.logoURI);
  const addressToUse =
    token?.address && (token.address === PROTOCOL_TOKEN_ADDRESS ? `${token.chainId}-${token.address}` : token.address);
  const boxShadow = withShadow ? colors[palette.mode].dropShadow[shadowType] : 'none';
  if (CryptoIcons[addressToUse as keyof typeof CryptoIcons]) {
    componentToRender = (
      <SvgIcon
        component={CryptoIcons[addressToUse as keyof typeof CryptoIcons]}
        viewBox="0 0 32 32"
        className={isInChip ? 'MuiChip-icon' : ''}
        style={{ fontSize: realSize, boxShadow, borderRadius: '50%' }}
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

  if (border) {
    return <StyledTokenIconContainer>{componentToRender}</StyledTokenIconContainer>;
  }

  return componentToRender;
};

export default TokenIcon;
