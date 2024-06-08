import React from 'react';
import { formatCurrencyAmount, formatUsdAmount, toToken } from '@common/utils/currency';
import { NETWORKS, getGhTokenListLogoUrl } from '@constants';
import { ChainId, Token } from 'common-types';
import styled from 'styled-components';
import TokenIcon from '@common/components/token-icon';
import { ContainerBox, Tooltip, Typography } from 'ui-library';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import { useIntl } from 'react-intl';

export type ChainBreakdown = {
  token: Token;
  balance: bigint;
  balanceUsd?: number;
  price?: number;
}[];

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

const TokenNetworksTooltip = ({ chainBreakdown }: { chainBreakdown: ChainBreakdown }) => {
  const intl = useIntl();
  const networkNames = Object.values(NETWORKS).reduce<Record<ChainId, string>>((acc, network) => {
    // eslint-disable-next-line no-param-reassign
    acc[network.chainId] = network.name;
    return acc;
  }, {});

  return (
    <ContainerBox flexDirection="column" gap={1}>
      {chainBreakdown.map((chainData, index) => (
        <ContainerBox key={index} gap={1} alignItems="center" justifyContent="start">
          <TokenIcon token={toToken({ logoURI: getGhTokenListLogoUrl(chainData.token.chainId, 'logo') })} size={3.5} />
          <Typography variant="bodySmallLabel">
            {`${networkNames[chainData.token.chainId]}: ${formatCurrencyAmount({
              amount: chainData.balance,
              token: chainData.token,
              sigFigs: 3,
              intl,
            })} ($${formatUsdAmount({ amount: chainData.balanceUsd, intl })})`}
          </Typography>
        </ContainerBox>
      ))}
    </ContainerBox>
  );
};

const TokenIconMultichain = ({ chainBreakdown }: { chainBreakdown: ChainBreakdown }) => {
  const orderedChainBreakdown = chainBreakdown.sort((a, b) => Number(b.balance - a.balance));

  const itemWithTokenIcon = orderedChainBreakdown.find((chainData) => chainData.token.logoURI) || chainBreakdown[0];

  const networkTokens = chainBreakdown.map((chainData) =>
    toToken({
      logoURI: getGhTokenListLogoUrl(chainData.token.chainId, 'logo'),
    })
  );
  return (
    <Tooltip title={<TokenNetworksTooltip chainBreakdown={chainBreakdown} />}>
      <StyledAssetLogosContainer $center={networkTokens.length === 2}>
        <TokenIcon token={itemWithTokenIcon?.token} size={8} />
        <StyledNetworkLogosContainer>
          <ComposedTokenIcon size={3.5} tokens={networkTokens} overlapRatio={0.6} marginRight={1.75} />
        </StyledNetworkLogosContainer>
      </StyledAssetLogosContainer>
    </Tooltip>
  );
};

export default TokenIconMultichain;
