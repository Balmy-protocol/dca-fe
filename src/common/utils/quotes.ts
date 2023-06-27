import { SORT_LEAST_GAS, SORT_MOST_PROFIT, SORT_MOST_RETURN, SwapSortOptions } from '@constants/aggregator';
import { parseUnits } from '@ethersproject/units';
import { SwapOption } from '@types';
import { BigNumber } from 'ethers';

export function calculateProfit(quote?: Nullable<SwapOption>) {
  if (!quote) return undefined;
  const { sellAmount, buyAmount } = quote;
  const soldUSD = sellAmount.amountInUSD && Number(sellAmount.amountInUSD);
  const boughtUSD = buyAmount.amountInUSD && Number(buyAmount.amountInUSD);
  const gasCostUSD = quote.gas?.estimatedCostInUSD && Number(quote.gas.estimatedCostInUSD);
  return !soldUSD || !boughtUSD || !gasCostUSD ? undefined : boughtUSD - soldUSD - gasCostUSD;
}

export const getBetterByLabel = (sorting: SwapSortOptions, isBuyOrder: boolean) => {
  if (sorting === SORT_MOST_RETURN) {
    if (isBuyOrder) {
      return 'less spent';
    }

    return 'more received';
  }
  if (sorting === SORT_MOST_PROFIT) {
    return 'more profitable';
  }

  if (sorting === SORT_LEAST_GAS) {
    return 'least gas used';
  }

  return '';
};

export const getWorseByLabel = (sorting: SwapSortOptions, isBuyOrder: boolean, addRecommended = false) => {
  if (sorting === SORT_MOST_RETURN) {
    if (isBuyOrder) {
      return `more spent${addRecommended ? ' than recommended' : ''}`;
    }

    return `less received${addRecommended ? ' than recommended' : ''}`;
  }
  if (sorting === SORT_MOST_PROFIT) {
    return `less profitable${addRecommended ? ' than recommended' : ''}`;
  }

  if (sorting === SORT_LEAST_GAS) {
    return `more gas used${addRecommended ? ' than recommended' : ''}`;
  }

  return '';
};

export const getBetterBy = (
  bestQuote: Nullable<SwapOption>,
  secondQuote: Nullable<SwapOption>,
  sorting: SwapSortOptions,
  isBuyOrder: boolean
) => {
  let betterBy: BigNumber | null | undefined = null;

  if (sorting === SORT_MOST_RETURN) {
    if (isBuyOrder) {
      betterBy =
        secondQuote &&
        bestQuote &&
        secondQuote.sellAmount.amount
          .mul(100)
          .mul(BigNumber.from(10).pow(18))
          .div(bestQuote.sellAmount.amount)
          .sub(BigNumber.from(10).pow(18).mul(100));
    } else {
      betterBy =
        secondQuote &&
        bestQuote &&
        bestQuote.buyAmount.amount
          .mul(100)
          .mul(BigNumber.from(10).pow(18))
          .div(secondQuote.buyAmount.amount)
          .sub(BigNumber.from(10).pow(18).mul(100));
    }
  } else if (sorting === SORT_MOST_PROFIT) {
    const profitBest = calculateProfit(bestQuote);
    const profitSecond = calculateProfit(secondQuote);
    if (profitBest && profitSecond) {
      betterBy = parseUnits(((profitBest * 100) / profitSecond).toString(), 18);
    }
  } else if (sorting === SORT_LEAST_GAS) {
    betterBy =
      secondQuote &&
      secondQuote.gas?.estimatedCost &&
      bestQuote &&
      bestQuote.gas?.estimatedCost
        .mul(100)
        .mul(BigNumber.from(10).pow(18))
        .div(secondQuote.gas?.estimatedCost)
        .sub(BigNumber.from(10).pow(18).mul(100));
  }

  return betterBy;
};

export const getWorseBy = (
  bestQuote: Nullable<SwapOption>,
  secondQuote: Nullable<SwapOption>,
  sorting: SwapSortOptions,
  isBuyOrder: boolean
) => {
  let worseBy: BigNumber | null | undefined = null;

  if (sorting === SORT_MOST_RETURN) {
    if (isBuyOrder) {
      worseBy =
        secondQuote &&
        bestQuote &&
        BigNumber.from(10)
          .pow(18)
          .mul(100)
          .sub(bestQuote.sellAmount.amount.mul(100).mul(BigNumber.from(10).pow(18)).div(secondQuote.sellAmount.amount));
    } else {
      worseBy =
        secondQuote &&
        bestQuote &&
        BigNumber.from(10)
          .pow(18)
          .mul(100)
          .sub(secondQuote.buyAmount.amount.mul(100).mul(BigNumber.from(10).pow(18)).div(bestQuote.buyAmount.amount));
    }
  } else if (sorting === SORT_MOST_PROFIT) {
    const profitBest = calculateProfit(bestQuote);
    const profitSecond = calculateProfit(secondQuote);
    if (profitBest && profitSecond) {
      worseBy = parseUnits((100 - (profitBest * 100) / profitSecond).toString(), 18);
    }
  } else if (sorting === SORT_LEAST_GAS) {
    worseBy =
      secondQuote &&
      bestQuote &&
      bestQuote.gas?.estimatedCost &&
      secondQuote.gas?.estimatedCost &&
      BigNumber.from(10)
        .pow(18)
        .mul(100)
        .sub(bestQuote.gas?.estimatedCost.mul(100).mul(BigNumber.from(10).pow(18)).div(secondQuote.gas?.estimatedCost));
  }

  return worseBy;
};
