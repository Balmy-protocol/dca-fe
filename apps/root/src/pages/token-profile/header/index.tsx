import React from 'react';
import useNetWorth from '@hooks/useNetWorth';
import { Token } from 'common-types';
import TokenIcon from '@common/components/token-icon';
import { ContainerBox, Typography, colors } from 'ui-library';
import NetWorthNumber from '@common/components/networth-number';

interface TokenProfileHeaderProps {
  token?: Token;
}

const TokenProfileHeader = ({ token }: TokenProfileHeaderProps) => {
  const { totalAssetValue, isLoadingAllBalances, isLoadingSomePrices } = useNetWorth({
    walletSelector: 'allWallets',
    tokens: token && [token],
  });

  const isLoading = isLoadingAllBalances || isLoadingSomePrices;

  return (
    <ContainerBox flexDirection="column" gap={3}>
      <ContainerBox alignItems="center" gap={4}>
        <TokenIcon token={token} size={10.5} />
        <Typography variant="h1Bold" color={({ palette: { mode } }) => colors[mode].typography.typo1}>
          {token?.name}
        </Typography>
      </ContainerBox>
      {(totalAssetValue !== undefined || isLoading) && (
        <NetWorthNumber variant="h4Bold" withAnimation addDolarSign value={totalAssetValue} isLoading={isLoading} />
      )}
    </ContainerBox>
  );
};

export default TokenProfileHeader;
