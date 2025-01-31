import React from 'react';
import { Token } from 'common-types';
import TokenIcon from '@common/components/token-icon';
import { ContainerBox, Typography } from 'ui-library';
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
        <Typography variant="h1Bold">{token?.name}</Typography>
      </ContainerBox>
      {(price !== undefined || isLoading) && (
        <NetWorthNumber
          variant="bodyLargeBold"
          value={parseBaseUsdPriceToNumber(price)}
          isLoading={isLoading}
          disableHiddenNumber
        />
      )}
    </ContainerBox>
  );
};

export default TokenProfileHeader;
