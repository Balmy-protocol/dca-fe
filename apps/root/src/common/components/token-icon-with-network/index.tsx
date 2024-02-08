import React from 'react';
import { toToken } from '@common/utils/currency';
import { getGhTokenListLogoUrl } from '@constants';
import { Token } from 'common-types';
import styled from 'styled-components';
import TokenIcon from '../token-icon';

const StyledNetworkLogoContainer = styled.div`
  position: absolute;
  bottom: -4px;
  right: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  border: 2px solid;
  width: 16px;
  height: 16px;
`;

const StyledAssetLogosContainer = styled.div`
  position: relative;
  display: flex;
`;

const TokenIconWithNetwork = ({ token }: { token: Token }) => (
  <StyledAssetLogosContainer>
    <TokenIcon token={token} size={8} />
    <StyledNetworkLogoContainer>
      <TokenIcon
        size={3.5}
        token={toToken({
          logoURI: getGhTokenListLogoUrl(token.chainId, 'logo'),
        })}
      />
    </StyledNetworkLogoContainer>
  </StyledAssetLogosContainer>
);

export default TokenIconWithNetwork;
