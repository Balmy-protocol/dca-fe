import React from 'react';
import { DisplayStrategy, FeeType } from 'common-types';
import { FormattedMessage } from 'react-intl';
import { ContainerBox, DividerBorder1, Skeleton, Typography } from 'ui-library';
import useRawUsdPrice from '@hooks/useUsdRawPrice';
import { isUndefined } from 'lodash';
import { parseUsdPrice } from '@common/utils/currency';
import { formatUnits } from 'viem';
import { calculateEarnFeeAmount } from '@common/utils/earn/parsing';

interface StrategyManagementFeesProps {
  strategy?: DisplayStrategy;
  feeType: FeeType;
  assetAmount?: string;
}

const StrategyManagementFees = ({ strategy, feeType, assetAmount }: StrategyManagementFeesProps) => {
  const [assetPrice, isLoadingPrice] = useRawUsdPrice(strategy?.asset);

  const feeAmount = React.useMemo(
    () => calculateEarnFeeAmount({ strategy, feeType, assetAmount }),
    [strategy, feeType, assetAmount]
  );

  if (!strategy?.guardian || isUndefined(feeAmount)) return null;
  return (
    <ContainerBox flexDirection="column" gap={2}>
      <DividerBorder1 />
      <ContainerBox justifyContent="space-between" alignItems="center">
        <Typography variant="bodySmallBold">
          <FormattedMessage description="strategy-management.fees" defaultMessage="Fees" />
        </Typography>
        <ContainerBox gap={1} alignItems="center">
          <Typography variant="bodySmallBold">
            {formatUnits(feeAmount, strategy.asset.decimals)} {strategy.asset.symbol}
          </Typography>
          <Typography variant="bodySmallBold">
            <>
              {isLoadingPrice ? (
                <Skeleton width="6ch" variant="text" animation="wave" />
              ) : (
                `($${parseUsdPrice(strategy.asset, feeAmount, assetPrice)})`
              )}
            </>
          </Typography>
        </ContainerBox>
      </ContainerBox>
    </ContainerBox>
  );
};

export default StrategyManagementFees;
