import React from 'react';
import { DisplayStrategy, FeeType } from 'common-types';
import { FormattedMessage } from 'react-intl';
import { ContainerBox, DividerBorder1, Skeleton, Typography } from 'ui-library';
import useRawUsdPrice from '@hooks/useUsdRawPrice';
import { isUndefined } from 'lodash';
import { parseUsdPrice } from '@common/utils/currency';
import { formatUnits, parseUnits } from 'viem';

interface StrategyManagementFeesProps {
  strategy?: DisplayStrategy;
  feeType: FeeType;
  assetAmount?: string;
}

const StrategyManagementFees = ({ strategy, feeType, assetAmount }: StrategyManagementFeesProps) => {
  const [assetPrice, isLoadingPrice] = useRawUsdPrice(strategy?.asset);

  const feeAmount = React.useMemo(() => {
    const feePercentage = strategy?.guardian?.fees.find((fee) => fee.type === feeType)?.percentage;

    if (!feePercentage || !assetAmount) return undefined;

    const parsedAssetAmount = parseUnits(assetAmount, strategy.asset.decimals);
    const feePercentageBigInt = BigInt(Math.round(feePercentage * 100));

    return (parsedAssetAmount * feePercentageBigInt) / 100n;
  }, [strategy, feeType, assetAmount]);

  return (
    <>
      {strategy?.guardian && !isUndefined(feeAmount) && (
        <ContainerBox flexDirection="column" gap={2}>
          <DividerBorder1 />
          <ContainerBox justifyContent="space-between" alignItems="center">
            <Typography variant="bodySmallBold">
              <FormattedMessage description="strategy-management.fees" defaultMessage="Fees" />
            </Typography>
            <ContainerBox gap={1} alignItems="center">
              <Typography variant="bodySmallBold">{formatUnits(feeAmount, strategy.asset.decimals)}</Typography>
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
      )}
    </>
  );
};

export default StrategyManagementFees;
