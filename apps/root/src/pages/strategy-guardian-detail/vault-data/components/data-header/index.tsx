import TokenIcon from '@common/components/token-icon';
import { toToken } from '@common/utils/currency';
import { getGhTokenListLogoUrl } from '@constants';
import { Strategy } from 'common-types';
import React from 'react';
import { Typography, colors, ContainerBox, Skeleton } from 'ui-library';
import { SPACING } from 'ui-library/src/theme/constants';

interface DataHeaderProps {
  strategy?: Strategy;
}

interface DataHeaderContentProps {
  strategy: Strategy;
}

const SkeletonDataHeader = () => (
  <>
    <ContainerBox alignItems="center" gap={2}>
      <Skeleton variant="circular" width={SPACING(8)} height={SPACING(8)} />
      <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
        <Skeleton variant="text" width="10ch" />
      </Typography>
    </ContainerBox>
    <Typography variant="bodySmallRegular">
      <Skeleton variant="circular" width={SPACING(8)} height={SPACING(8)} />
    </Typography>
  </>
);

const DataHeaderContent = ({ strategy: { asset, network } }: DataHeaderContentProps) => (
  <>
    <ContainerBox alignItems="center" gap={2}>
      <TokenIcon size={8} token={asset} />
      <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
        {asset.symbol}
      </Typography>
    </ContainerBox>
    <Typography variant="bodySmallRegular">
      <TokenIcon
        size={8}
        token={toToken({
          logoURI: getGhTokenListLogoUrl(network.chainId, 'logo'),
        })}
      />
    </Typography>
  </>
);

const DataHeader = ({ strategy }: DataHeaderProps) => {
  if (!strategy) {
    return (
      <ContainerBox alignItems="center" justifyContent="space-between">
        <SkeletonDataHeader />
      </ContainerBox>
    );
  }

  return (
    <ContainerBox alignItems="center" justifyContent="space-between">
      <DataHeaderContent strategy={strategy} />
    </ContainerBox>
  );
};

export default DataHeader;
