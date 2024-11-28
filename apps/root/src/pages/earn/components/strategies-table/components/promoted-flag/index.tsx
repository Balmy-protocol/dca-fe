import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { baseColors, colors, ContainerBox, TrendUpIcon, Typography } from 'ui-library';

const StyledPromotedFlagContainer = styled(ContainerBox).attrs({
  flexDirection: 'column',
  alignItems: 'flex-start',
})<{ $isCard?: boolean }>`
  ${({ theme: { spacing }, $isCard }) => `
    position: absolute;
    left: -${spacing(2 + ($isCard ? 0.25 : 0))}; // For cards, we need to take border into account
    ${
      $isCard
        ? `
      bottom: ${spacing(6)};
    `
        : `
      top: ${spacing(0.5)};
    `
    }
  `}
`;

const StyledPromotedFlag = styled(ContainerBox).attrs({
  gap: 1,
  alignItems: 'center',
})<{ $isCard?: boolean }>`
  ${({ theme: { palette, spacing }, $isCard }) => `
    background-color: ${colors[palette.mode].semantic.success.darker};
    padding: ${$isCard ? `${spacing(1)} ${spacing(2)}` : `${spacing(0.5)} ${spacing(1)}`};
    border-radius: ${spacing(0.5)} ${spacing(0.5)} 0 0;
  `}
`;

const TriangleBehindFlag = styled.div`
  ${({ theme: { spacing } }) => `
    width: 0;
    height: 0;
    border-bottom: ${spacing(1)} solid transparent;
    border-left: ${spacing(1)} solid transparent;
    border-top: ${spacing(1)} solid ${baseColors.semantic.green.green800};
    border-right: ${spacing(1)} solid ${baseColors.semantic.green.green800};
  `}
`;

const PromotedFlag = ({ isCard }: { isCard?: boolean }) => (
  <StyledPromotedFlagContainer $isCard={isCard}>
    <StyledPromotedFlag $isCard={isCard}>
      <TrendUpIcon sx={{ color: baseColors.white, fontSize: isCard ? '1.125rem' : '0.75rem' }} />
      <Typography variant={isCard ? 'bodySmallRegular' : 'bodyExtraExtraSmall'} color={baseColors.white}>
        <FormattedMessage description="earn.strategies-table.promoted-flag" defaultMessage="Promoted" />
      </Typography>
    </StyledPromotedFlag>
    <TriangleBehindFlag />
  </StyledPromotedFlagContainer>
);

export default PromotedFlag;
