import React from 'react';
import { DisplayStrategy } from 'common-types';
import { colors, ContainerBox, RainCoins, Skeleton, Typography } from 'ui-library';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import TokenIcon from '@common/components/token-icon';
import { formatListMessage } from '@common/utils/parsing';

const StyledRewardsContainer = styled(ContainerBox).attrs({
  flexDirection: 'column',
  gap: 2,
})`
  ${({ theme: { palette, space, spacing } }) => `
    padding: ${space.s04};
    border-radius: ${spacing(3)};
    border: 1px solid ${colors[palette.mode].border.border1};
    background: ${palette.gradient.rewards};
    position: relative;
  `}
`;
const StyledRainCoins = styled(RainCoins)`
  position: absolute;
  bottom: 0;
  right: 0;
  height: 100%;
  width: 215px;
  max-width: 50%;
`;

const RewardsContainer = ({ strategy }: { strategy?: DisplayStrategy }) => {
  const intl = useIntl();
  const isLoading = !strategy;
  const asset = strategy?.asset;
  const rewards = strategy?.displayRewards;

  if (!rewards?.tokens?.length && !isLoading) return null;
  return (
    <StyledRewardsContainer>
      <Typography variant="h5Bold">
        {isLoading ? (
          <Skeleton variant="text" width="7ch" />
        ) : (
          <FormattedMessage defaultMessage="Rewards" description="earn.strategy-details.vault-about.rewards" />
        )}
      </Typography>
      <Typography variant="bodySmallRegular" maxWidth="60%">
        {isLoading ? (
          <Skeleton variant="text" width="20ch" />
        ) : (
          <FormattedMessage
            description="earn.strategy-details.vault-about.rewards-description"
            defaultMessage="For each {asset} deposited, you will earn {apy}% APY in {rewards}."
            values={{
              asset: asset?.symbol,
              apy: rewards?.apy.toFixed(2),
              rewards: formatListMessage({
                items: rewards?.tokens.map((token) => token.symbol),
                intl,
              }),
            }}
          />
        )}
      </Typography>
      <ContainerBox gap={2} flexWrap="wrap">
        {rewards?.tokens.map((token) => (
          <ContainerBox key={token.address} gap={2} alignItems="center">
            <TokenIcon token={token} size={8} border />
            <ContainerBox flexDirection="column" gap={0.5}>
              <Typography variant="bodySmallSemibold" color={({ palette }) => colors[palette.mode].typography.typo2}>
                {token.symbol}
              </Typography>
              <Typography variant="labelRegular" color={({ palette }) => colors[palette.mode].typography.typo3}>
                {token.symbol}
              </Typography>
            </ContainerBox>
          </ContainerBox>
        ))}
      </ContainerBox>
      <StyledRainCoins />
    </StyledRewardsContainer>
  );
};

export default RewardsContainer;
