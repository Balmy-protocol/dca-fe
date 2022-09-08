import TokenIcon from 'common/token-icon';
import React from 'react';
import styled from 'styled-components';
import { Token } from 'types';

const StyledComposedTokenIconContainer = styled.div`
  display: flex;
  position: relative;
  margin-right: 10px;
`;

const StyledBottomTokenContainer = styled.div`
  border: 2px solid transparent;
  display: flex;
`;

const StyledTopTokenContainer = styled.div`
  position: absolute;
  right: -10px;
  border: 2px solid rgb(59 59 59);
  display: flex;
  border-radius: 100px;
`;

interface TokenButtonProps {
  tokenTop?: Token;
  tokenBottom?: Token;
  isInChip?: boolean;
  size?: string;
}

const ComposedTokenIcon = ({ tokenTop, tokenBottom, isInChip, size }: TokenButtonProps) => {
  const realSize = size || '28px';

  return (
    <StyledComposedTokenIconContainer>
      <StyledBottomTokenContainer>
        <TokenIcon token={tokenBottom} isInChip={isInChip} size={realSize} />
      </StyledBottomTokenContainer>
      <StyledTopTokenContainer>
        <TokenIcon token={tokenTop} isInChip={isInChip} size={realSize} />
      </StyledTopTokenContainer>
    </StyledComposedTokenIconContainer>
  );
};

export default ComposedTokenIcon;
