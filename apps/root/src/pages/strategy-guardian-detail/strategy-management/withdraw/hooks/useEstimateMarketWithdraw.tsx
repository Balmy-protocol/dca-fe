import React from 'react';
import { parseUsdPrice, parseNumberUsdPriceToBigInt } from '@common/utils/currency';
import { formatUnits, parseUnits } from 'viem';
import { calculateEarnFeeAmount } from '@common/utils/earn/parsing';
import useEarnService from '@hooks/earn/useEarnService';
import { useEarnManagementState } from '@state/earn-management/hooks';
import { AmountsOfToken, DisplayStrategy, EarnPosition, FeeType } from 'common-types';

interface UseEstimateMarketWithdrawProps {
  strategy?: DisplayStrategy;
  shouldRefetch: boolean;
  position?: EarnPosition;
}

export default function useEstimateMarketWithdraw({
  strategy,
  shouldRefetch,
  position,
}: UseEstimateMarketWithdrawProps) {
  const earnService = useEarnService();
  const [estimatedMarketAmount, setEstimatedMarketAmount] = React.useState<AmountsOfToken | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);
  const { withdrawAmount, asset } = useEarnManagementState();

  const { withdrawAmountOfToken, withdrawFeeAmountOfToken } = React.useMemo<{
    withdrawAmountOfToken: AmountsOfToken | undefined;
    withdrawFeeAmountOfToken: AmountsOfToken | undefined;
  }>(() => {
    const parsedWithdrawFeeAmount = calculateEarnFeeAmount({
      assetAmount: withdrawAmount,
      strategy,
      feeType: FeeType.WITHDRAW,
    });

    return {
      withdrawAmountOfToken:
        withdrawAmount && asset
          ? {
              amount: parseUnits(withdrawAmount, asset.decimals),
              amountInUnits: withdrawAmount,
              amountInUSD: parseUsdPrice(
                asset,
                parseUnits(withdrawAmount, asset.decimals),
                parseNumberUsdPriceToBigInt(asset.price)
              ).toFixed(2),
            }
          : undefined,
      withdrawFeeAmountOfToken:
        parsedWithdrawFeeAmount && asset
          ? {
              amount: parsedWithdrawFeeAmount,
              amountInUnits: formatUnits(parsedWithdrawFeeAmount, asset.decimals),
              amountInUSD: parseUsdPrice(
                asset,
                parsedWithdrawFeeAmount,
                parseNumberUsdPriceToBigInt(asset.price)
              ).toFixed(2),
            }
          : undefined,
    };
  }, [withdrawAmount, asset, strategy]);

  React.useEffect(() => {
    if (!strategy || !position || !asset || !withdrawAmountOfToken) return;

    const estimateFn = async () => {
      try {
        const data = await earnService.estimateMarketWithdraw({
          chainId: strategy.network.chainId,
          positionId: position.id,
          token: asset.address,
          amount: withdrawAmountOfToken.amount,
        });
        setEstimatedMarketAmount(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    if (shouldRefetch) {
      setIsLoading(true);
      void estimateFn();
    }
  }, [shouldRefetch]);

  return React.useMemo(
    () => ({
      isLoading,
      estimatedMarketAmount,
      withdrawAmountOfToken,
      withdrawFeeAmountOfToken,
    }),
    [isLoading, estimatedMarketAmount, withdrawAmountOfToken, withdrawFeeAmountOfToken]
  );
}
