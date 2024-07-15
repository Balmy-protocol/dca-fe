import React from 'react';
import { EarnPosition } from 'common-types';
import { isSameToken } from '@common/utils/currency';

export default function useUserStrategiesFinancial(userPositions: EarnPosition[] = []) {
  return React.useMemo(() => {
    const totalInvestedUsd = userPositions.reduce((acc, position) => {
      const assetBalance = position.balances.find((balance) => isSameToken(balance.token, position.strategy.asset));
      // eslint-disable-next-line no-param-reassign
      return acc + Number(assetBalance?.amount.amountInUSD) || 0;
    }, 0);

    const currentProfitUsd = userPositions.reduce((acc, position) => {
      const allProfits = position.balances.reduce((profitAcc, balance) => {
        // eslint-disable-next-line no-param-reassign
        return profitAcc + Number(balance.profit.amountInUSD) || 0;
      }, 0);

      return acc + allProfits;
    }, 0);

    const currentProfitRate = (currentProfitUsd / totalInvestedUsd) * 100;

    return { totalInvestedUsd, currentProfitUsd, currentProfitRate };
  }, [userPositions]);
}
