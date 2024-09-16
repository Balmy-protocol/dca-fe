import React from 'react';
import { toToken } from '@common/utils/currency';
import { getGhTokenListLogoUrl } from '@constants';
import { Token } from 'common-types';
import styled from 'styled-components';
import TokenIcon, { TokenIconProps } from '../token-icon';

const StyledNetworkLogoContainer = styled.div`
  position: absolute;
  bottom: -4px;
  right: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  width: 16px;
  height: 16px;
`;

const StyledAssetLogosContainer = styled.div`
  position: relative;
  display: flex;
`;

interface TokenIconWithNetworkProps {
  token: Token;
  tokenSize?: TokenIconProps['size'];
  networkSize?: TokenIconProps['size'];
}

const TokenIconWithNetwork = ({ token, tokenSize = 8, networkSize = 3.5 }: TokenIconWithNetworkProps) => (
  <StyledAssetLogosContainer>
    <TokenIcon token={token} size={tokenSize} />
    <StyledNetworkLogoContainer>
      <TokenIcon
        size={networkSize}
        token={toToken({
          logoURI: getGhTokenListLogoUrl(token.chainId, 'logo'),
        })}
      />
    </StyledNetworkLogoContainer>
  </StyledAssetLogosContainer>
);

export default TokenIconWithNetwork;
