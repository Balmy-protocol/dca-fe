import React from 'react';
import { Token } from 'common-types';
import TokenIcon from '@common/components/token-icon';
import { ContainerBox, Typography, colors } from 'ui-library';
import NetWorthNumber from '@common/components/networth-number';
import useRawUsdPrice from '@hooks/useUsdRawPrice';
import { parseBaseUsdPriceToNumber } from '@common/utils/currency';

interface TokenProfileHeaderProps {
  token?: Token;
}

const TokenProfileHeader = ({ token }: TokenProfileHeaderProps) => {
  const [price, isLoading] = useRawUsdPrice(token);

  return (
    <ContainerBox flexDirection="column" gap={3}>
      <ContainerBox alignItems="center" gap={4}>
        <TokenIcon token={token} size={10.5} />
        <Typography variant="h1Bold" color={({ palette: { mode } }) => colors[mode].typography.typo1}>
          {token?.name}
        </Typography>
      </ContainerBox>
      {(price !== undefined || isLoading) && (
        <NetWorthNumber variant="h4Bold" value={parseBaseUsdPriceToNumber(price)} isLoading={isLoading} />
      )}
    </ContainerBox>
  );
};

export default TokenProfileHeader;
