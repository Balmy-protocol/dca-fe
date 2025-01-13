import TokenIcon from '@common/components/token-icon';
import React from 'react';
import styled from 'styled-components';
import { Token } from '@types';
import { toToken } from '@common/utils/currency';
import { getGhTokenListLogoUrl } from '@constants';
import { Skeleton, useTheme, colors, Typography, ContainerBox } from 'ui-library';
import { compact, isUndefined } from 'lodash';

const StyledComposedTokenIconContainer = styled.div<{ marginRight: number }>`
  display: flex;
  position: relative;
  margin-right: ${({ theme, marginRight }) => theme.spacing(marginRight)};
  align-items: end;
`;

const StyledTopTokenContainer = styled(ContainerBox).attrs({
  alignItems: 'center',
  justifyContent: 'center',
})<{ $right?: number; $isFirst?: boolean }>`
  ${({ theme: { palette, spacing }, $right = 0, $isFirst = false }) => `
  ${!$isFirst ? 'position: absolute;' : ''}
  right: -${spacing($right)};
  border-radius: 100px;
  background-color: ${colors[palette.mode].background.quartery};
  backdrop-filter: blur(30px);
  min-width: 16px;
  min-height: 16px;
`}
`;

const StyledNetworkLogoContainer = styled(ContainerBox).attrs({
  alignItems: 'center',
  justifyContent: 'center,',
})<{ $right: number }>`
  ${({ theme, $right }) => `
  position: absolute;
  bottom: -4px;
  right: ${theme.spacing($right)};
  border-radius: 30px;
  width: 16px;
  height: 16px;
`}
`;

interface ComposedTokenIconProps {
  tokens?: (Token | undefined)[];
  withNetwork?: boolean;
  isInChip?: boolean;
  size?: number;
  isLoading?: boolean;
  overlapRatio?: number;
  marginRight?: number;
  withShadow?: boolean;
  maxTokens?: number;
}
const ComposedTokenIcon = ({
  tokens,
  isInChip,
  size = 7,
  withNetwork,
  isLoading,
  overlapRatio = 0.6,
  marginRight = 2.5,
  withShadow,
  maxTokens = 3,
}: ComposedTokenIconProps) => {
  const theme = useTheme();
  const marginRightToUse = compact(tokens).length === 1 ? 0 : marginRight;
  const overlapRatioToUse = compact(tokens).length === 1 ? 0 : overlapRatio;

  if (isLoading) {
    const sizeInPx = theme.spacing(size);
    const skeletonItems = Array.from({ length: tokens?.length ?? 2 }, (_, index) => index);
    return (
      <StyledComposedTokenIconContainer marginRight={marginRightToUse}>
        {skeletonItems.map((_, index) =>
          index === 0 ? (
            <StyledTopTokenContainer key={index}>
              <Skeleton variant="circular" animation="wave" height={sizeInPx} width={sizeInPx} />
            </StyledTopTokenContainer>
          ) : (
            <StyledTopTokenContainer key={index} $right={size * index * overlapRatioToUse}>
              <Skeleton variant="circular" animation="wave" height={sizeInPx} width={sizeInPx} />
            </StyledTopTokenContainer>
          )
        )}
      </StyledComposedTokenIconContainer>
    );
  }

  if (!tokens || tokens.length === 0) {
    return null;
  }

  const chainId = tokens.find((token) => !isUndefined(token?.chainId))?.chainId;

  const isOverflown = tokens.length > maxTokens;
  const tokensToDisplay = isOverflown ? tokens.slice(0, maxTokens) : tokens;

  // We move the network icon to the right, starting from spacing(1), adding any overlapped width
  const networkIconRight = tokens.length !== 1 ? -size * overlapRatioToUse - 1 : -1;

  return (
    <StyledComposedTokenIconContainer marginRight={marginRightToUse}>
      {tokensToDisplay.map((token, index) => (
        <StyledTopTokenContainer $isFirst={index === 0} key={index} $right={size * index * overlapRatioToUse}>
          {index === maxTokens - 1 && isOverflown ? (
            <Typography variant="bodyExtraSmall" fontSize="9px">
              +{tokens.length - maxTokens}
            </Typography>
          ) : (
            <TokenIcon border token={token} isInChip={isInChip} size={size} withShadow={withShadow} />
          )}
        </StyledTopTokenContainer>
      ))}
      {chainId && withNetwork && (
        <StyledNetworkLogoContainer $right={networkIconRight}>
          <TokenIcon
            size={3.5}
            token={toToken({
              logoURI: getGhTokenListLogoUrl(chainId, 'logo'),
            })}
            withShadow={withShadow}
          />
        </StyledNetworkLogoContainer>
      )}
    </StyledComposedTokenIconContainer>
  );
};

export default ComposedTokenIcon;
