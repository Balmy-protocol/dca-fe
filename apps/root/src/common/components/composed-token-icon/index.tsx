import TokenIcon from '@common/components/token-icon';
import React from 'react';
import styled from 'styled-components';
import { Token } from '@types';
import { toToken } from '@common/utils/currency';
import { getGhTokenListLogoUrl } from '@constants';
import { Skeleton, useTheme, colors, Typography } from 'ui-library';
import { compact, isUndefined } from 'lodash';

const StyledComposedTokenIconContainer = styled.div<{ marginRight: number }>`
  display: flex;
  position: relative;
  margin-right: ${({ theme, marginRight }) => theme.spacing(marginRight)};
`;

const StyledBottomTokenContainer = styled.div`
  border: 1.1px solid transparent;
  display: flex;
`;

const StyledTopTokenContainer = styled.div<{ $right?: number }>`
  ${({ theme: { palette, spacing }, $right = 0 }) => `
  position: absolute;
  right: -${spacing($right)};
  border: 1.1px solid ${colors[palette.mode].background.secondary};
  display: flex;
  align-items: center;
  border-radius: 100px;
  background-color: ${colors[palette.mode].background.quarteryNoAlpha};
  min-width: 16px;
  min-height: 16px;
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

interface ComposedTokenIconProps {
  tokens: (Token | undefined)[];
  withNetwork?: boolean;
  isInChip?: boolean;
  size?: number;
  isLoading?: boolean;
  overlapRatio?: number;
  marginRight?: number;
}
const ComposedTokenIcon = ({
  tokens,
  isInChip,
  size = 7,
  withNetwork,
  isLoading,
  overlapRatio = 0.5,
  marginRight = 2.5,
}: ComposedTokenIconProps) => {
  const theme = useTheme();
  const marginRightToUse = compact(tokens).length === 1 ? 0 : marginRight;

  if (isLoading) {
    const sizeInPx = theme.spacing(size);
    return (
      <StyledComposedTokenIconContainer marginRight={marginRightToUse}>
        {tokens.map((_, index) =>
          index === 0 ? (
            <StyledBottomTokenContainer key={index}>
              <Skeleton variant="circular" animation="wave" height={sizeInPx} width={sizeInPx} />
            </StyledBottomTokenContainer>
          ) : (
            <StyledTopTokenContainer key={index} $right={size * index * overlapRatio}>
              <Skeleton variant="circular" animation="wave" height={sizeInPx} width={sizeInPx} />
            </StyledTopTokenContainer>
          )
        )}
      </StyledComposedTokenIconContainer>
    );
  }

  const chainId = tokens.find((token) => !isUndefined(token?.chainId))?.chainId;

  const isOverflown = tokens.length > 3;
  const tokensToDisplay = isOverflown ? tokens.slice(0, 3) : tokens;

  return (
    <StyledComposedTokenIconContainer marginRight={marginRightToUse}>
      {tokensToDisplay.map((token, index) =>
        index === 0 ? (
          <StyledBottomTokenContainer key={index}>
            <TokenIcon token={token} isInChip={isInChip} size={size} />
          </StyledBottomTokenContainer>
        ) : (
          <StyledTopTokenContainer key={index} $right={size * index * overlapRatio}>
            {index === 2 && isOverflown ? (
              <Typography variant="bodyExtraSmall" fontSize="10px">
                +{tokens.length - 2}
              </Typography>
            ) : (
              <TokenIcon token={token} isInChip={isInChip} size={size} />
            )}
          </StyledTopTokenContainer>
        )
      )}
      {chainId && withNetwork && (
        <StyledNetworkLogoContainer>
          <TokenIcon
            size={3.5}
            token={toToken({
              logoURI: getGhTokenListLogoUrl(chainId, 'logo'),
            })}
          />
        </StyledNetworkLogoContainer>
      )}
    </StyledComposedTokenIconContainer>
  );
};

export default ComposedTokenIcon;
