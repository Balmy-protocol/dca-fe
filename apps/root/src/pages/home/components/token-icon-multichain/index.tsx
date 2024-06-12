import React from 'react';
import { formatCurrencyAmount, formatUsdAmount, toToken } from '@common/utils/currency';
import { NETWORKS, getGhTokenListLogoUrl } from '@constants';
import { ChainId } from 'common-types';
import styled from 'styled-components';
import TokenIcon from '@common/components/token-icon';
import { ContainerBox, Tooltip, Typography } from 'ui-library';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import { useIntl } from 'react-intl';
import { BalanceTokens } from '../portfolio';

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

const TokenNetworksTooltipTitle = ({ balanceTokens }: { balanceTokens: BalanceTokens }) => {
  const intl = useIntl();
  const networkNames = Object.values(NETWORKS).reduce<Record<ChainId, string>>((acc, network) => {
    // eslint-disable-next-line no-param-reassign
    acc[network.chainId] = network.name;
    return acc;
  }, {});

  return (
    <ContainerBox flexDirection="column" gap={1}>
      {balanceTokens.map((chainData, index) => (
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

const TokenIconMultichain = ({ balanceTokens }: { balanceTokens: BalanceTokens }) => {
  const orderedBalanceTokens = balanceTokens.sort((a, b) => Number(b.balance - a.balance));

  const itemWithTokenIcon = orderedBalanceTokens.find((chainData) => chainData.token.logoURI) || balanceTokens[0];

  const networkTokens = balanceTokens.map((chainData) =>
    toToken({
      logoURI: getGhTokenListLogoUrl(chainData.token.chainId, 'logo'),
    })
  );
  return (
    <Tooltip title={<TokenNetworksTooltipTitle balanceTokens={balanceTokens} />}>
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
