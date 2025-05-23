import React from 'react';
import { formatCurrencyAmount, formatUsdAmount, toToken } from '@common/utils/currency';
import { getGhTokenListLogoUrl } from '@constants';
import styled from 'styled-components';
import TokenIcon from '@common/components/token-icon';
import { ContainerBox, Skeleton, Tooltip, Typography } from 'ui-library';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import { useIntl } from 'react-intl';
import { BalanceToken } from '@hooks/useMergedTokensBalances';

const StyledAssetLogosContainer = styled(ContainerBox).attrs({ flexDirection: 'column' })<{ $center: boolean }>`
  ${({ $center }) => `
  position: relative;
  ${
    $center &&
    `
      display: flex;
      align-items: center;
    `
  }
`}
`;

const StyledNetworkLogosContainer = styled.div`
  position: absolute;
  bottom: -4px;
`;

export const TokenNetworksTooltipTitle = ({
  balanceTokens,
  isTokenBreakdown,
}: {
  balanceTokens: BalanceToken[];
  isTokenBreakdown?: boolean;
}) => {
  const intl = useIntl();

  return (
    <ContainerBox flexDirection="column" gap={1}>
      {balanceTokens.map((chainData, index) => (
        <ContainerBox key={index} gap={1} alignItems="center" justifyContent="start">
          <TokenIcon
            border
            token={
              isTokenBreakdown
                ? chainData.token
                : toToken({ logoURI: getGhTokenListLogoUrl(chainData.token.chainId, 'logo') })
            }
            size={3.5}
          />
          <Typography variant="labelRegular">
            {`${formatCurrencyAmount({
              amount: chainData.balance,
              token: chainData.token,
              sigFigs: 3,
              intl,
            })}`}
          </Typography>
          <Typography variant="labelRegular">
            {chainData.isLoadingPrice ? (
              <Skeleton width="3ch" />
            ) : (
              `($${formatUsdAmount({ amount: chainData.balanceUsd, intl })})`
            )}
          </Typography>
        </ContainerBox>
      ))}
    </ContainerBox>
  );
};

const TokenIconMultichain = ({
  balanceTokens,
  withShadow,
}: {
  balanceTokens: BalanceToken[];
  withShadow?: boolean;
}) => {
  const orderedBalanceTokens = balanceTokens.sort((a, b) => Number((b.balanceUsd ?? 0) - (a.balanceUsd ?? 0)));

  const itemWithTokenIcon = orderedBalanceTokens.find((chainData) => chainData.token.logoURI) || balanceTokens[0];

  const networkTokens = balanceTokens.map((chainData) =>
    toToken({
      logoURI: getGhTokenListLogoUrl(chainData.token.chainId, 'logo'),
    })
  );
  return (
    <Tooltip title={<TokenNetworksTooltipTitle balanceTokens={balanceTokens} />}>
      <StyledAssetLogosContainer $center={networkTokens.length === 2}>
        <TokenIcon token={itemWithTokenIcon?.token} size={8} withShadow={withShadow} />
        <StyledNetworkLogosContainer>
          <ComposedTokenIcon size={3.5} tokens={networkTokens} overlapRatio={0.75} marginRight={1.75} withShadow />
        </StyledNetworkLogosContainer>
      </StyledAssetLogosContainer>
    </Tooltip>
  );
};

export default TokenIconMultichain;
