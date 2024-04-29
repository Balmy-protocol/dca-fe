import TokenIcon from '@common/components/token-icon';
import React from 'react';
import styled from 'styled-components';
import { Token } from '@types';
import { toToken } from '@common/utils/currency';
import { getGhTokenListLogoUrl } from '@constants';
import { Skeleton, useTheme, colors } from 'ui-library';

const StyledComposedTokenIconContainer = styled.div<{ hasTokenTop: boolean }>`
  display: flex;
  position: relative;
  margin-right: ${({ hasTokenTop }) => (hasTokenTop ? '10px' : '0px')};
`;

const StyledBottomTokenContainer = styled.div`
  border: 1.1px solid transparent;
  display: flex;
`;

const StyledTopTokenContainer = styled.div`
  ${({ theme: { palette } }) => `
  position: absolute;
  right: -14px;
  border: 1.1px solid ${colors[palette.mode].background.secondary};
  display: flex;
  border-radius: 100px;
`}
`;

const StyledNetworkLogoContainer = styled.div`
  position: absolute;
  bottom: -4px;
  right: -14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  width: 16px;
  height: 16px;
`;

interface TokenButtonProps {
  tokenTop?: Token;
  tokenBottom?: Token;
  withNetwork?: boolean;
  isInChip?: boolean;
  size?: number;
  isLoading?: boolean;
}

const ComposedTokenIcon = ({ tokenTop, tokenBottom, isInChip, size = 7, withNetwork, isLoading }: TokenButtonProps) => {
  const theme = useTheme();
  if (isLoading) {
    const sizeInPx = theme.spacing(size);
    return (
      <StyledComposedTokenIconContainer hasTokenTop>
        <StyledBottomTokenContainer>
          <Skeleton variant="circular" animation="wave" height={sizeInPx} width={sizeInPx} />
        </StyledBottomTokenContainer>
        <StyledTopTokenContainer>
          <Skeleton variant="circular" animation="wave" height={sizeInPx} width={sizeInPx} />
        </StyledTopTokenContainer>
      </StyledComposedTokenIconContainer>
    );
  }

  return (
    <StyledComposedTokenIconContainer hasTokenTop={!!tokenTop}>
      <StyledBottomTokenContainer>
        <TokenIcon token={tokenBottom} isInChip={isInChip} size={size} />
      </StyledBottomTokenContainer>
      {tokenTop && (
        <StyledTopTokenContainer>
          <TokenIcon token={tokenTop} isInChip={isInChip} size={size} />
        </StyledTopTokenContainer>
      )}
      {(tokenBottom?.chainId || tokenTop?.chainId) && withNetwork && (
        <StyledNetworkLogoContainer>
          <TokenIcon
            size={3.5}
            token={toToken({
              logoURI: getGhTokenListLogoUrl(tokenBottom?.chainId || tokenTop?.chainId || 1, 'logo'),
            })}
          />
        </StyledNetworkLogoContainer>
      )}
    </StyledComposedTokenIconContainer>
  );
};

export default ComposedTokenIcon;
