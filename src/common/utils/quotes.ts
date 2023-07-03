import { SORT_LEAST_GAS, SORT_MOST_PROFIT, SORT_MOST_RETURN, SwapSortOptions } from '@constants/aggregator';
import { parseUnits } from '@ethersproject/units';
import { v4 as uuidv4 } from 'uuid';
import isUndefined from 'lodash/isUndefined';
import { QuoteResponse } from '@mean-finance/sdk';
import { SwapOption } from '@types';
import { BigNumber } from 'ethers';
import { formatCurrencyAmount, toToken } from './currency';

export function calculateProfit(quote?: Nullable<SwapOption>) {
  if (!quote) return undefined;
  const { sellAmount, buyAmount } = quote;
  const soldUSD = sellAmount.amountInUSD && Number(sellAmount.amountInUSD);
  const boughtUSD = buyAmount.amountInUSD && Number(buyAmount.amountInUSD);
  const gasCostUSD = quote.gas?.estimatedCostInUSD && Number(quote.gas.estimatedCostInUSD);
  return !soldUSD || !boughtUSD || !gasCostUSD ? undefined : boughtUSD - soldUSD - gasCostUSD;
}

export const getBetterByLabel = (sorting: SwapSortOptions, isBuyOrder: boolean, addRecommended = false) => {
  if (sorting === SORT_MOST_RETURN) {
    if (isBuyOrder) {
      return `less spent${addRecommended ? ' than second best' : ''}`;
    }

    return `more received${addRecommended ? ' than second best' : ''}`;
  }
  if (sorting === SORT_MOST_PROFIT) {
    return `more profitable${addRecommended ? ' than second best' : ''}`;
  }

  if (sorting === SORT_LEAST_GAS) {
    return `least gas used${addRecommended ? ' than second best' : ''}`;
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
          .sub(bestQuote.sellAmount.amount)
          .mul(BigNumber.from(10).pow(18))
          .div(secondQuote.sellAmount.amount)
          .mul(100);
    } else {
      betterBy =
        secondQuote &&
        bestQuote &&
        bestQuote.buyAmount.amount
          .sub(secondQuote.buyAmount.amount)
          .mul(BigNumber.from(10).pow(18))
          .div(secondQuote.buyAmount.amount)
          .mul(100);
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
      bestQuote.gas?.estimatedCost &&
      secondQuote.gas.estimatedCost
        .sub(bestQuote.gas.estimatedCost)
        .mul(BigNumber.from(10).pow(18))
        .div(secondQuote.gas.estimatedCost)
        .mul(100);
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
        secondQuote.sellAmount.amount
          .sub(bestQuote.sellAmount.amount)
          .mul(BigNumber.from(10).pow(18))
          .div(bestQuote.sellAmount.amount)
          .mul(100);
    } else {
      worseBy =
        secondQuote &&
        bestQuote &&
        bestQuote.buyAmount.amount
          .sub(secondQuote.buyAmount.amount)
          .mul(BigNumber.from(10).pow(18))
          .div(bestQuote.buyAmount.amount)
          .mul(100);
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
      secondQuote.gas.estimatedCost
        .sub(bestQuote.gas.estimatedCost)
        .mul(BigNumber.from(10).pow(18))
        .div(bestQuote.gas.estimatedCost)
        .mul(100);
  }

  return worseBy;
};

export const quoteResponseToSwapOption = ({
  sellToken,
  buyToken,
  sellAmount: { amount: sellAmountAmount, amountInUnits: sellAmountAmountInUnits, amountInUSD: sellAmountAmountInUsd },
  buyAmount: { amount: buyAmountAmount, amountInUnits: buyAmountAmountInUnits, amountInUSD: buyAmountAmountInUsd },
  maxSellAmount: {
    amount: maxSellAmountAmount,
    amountInUnits: maxSellAmountAmountInUnits,
    amountInUSD: maxSellAmountAmountInUsd,
  },
  minBuyAmount: {
    amount: minBuyAmountAmount,
    amountInUnits: minBuyAmountAmountInUnits,
    amountInUSD: minBuyAmountAmountInUsd,
  },
  gas,
  source: { allowanceTarget, logoURI, name, id },
  type,
  tx,
  recipient,
}: QuoteResponse) => ({
  id: uuidv4(),
  transferTo: recipient,
  sellToken: toToken(sellToken),
  buyToken: toToken(buyToken),
  sellAmount: {
    amount: BigNumber.from(sellAmountAmount),
    amountInUnits: sellAmountAmountInUnits,
    amountInUSD: (!isUndefined(sellAmountAmountInUsd) && Number(sellAmountAmountInUsd)) || undefined,
  },
  buyAmount: {
    amount: BigNumber.from(buyAmountAmount),
    amountInUnits: buyAmountAmountInUnits,
    amountInUSD: (!isUndefined(buyAmountAmountInUsd) && Number(buyAmountAmountInUsd)) || undefined,
  },
  maxSellAmount: {
    amount: BigNumber.from(maxSellAmountAmount),
    amountInUnits: maxSellAmountAmountInUnits,
    amountInUSD: (!isUndefined(maxSellAmountAmountInUsd) && Number(maxSellAmountAmountInUsd)) || undefined,
  },
  minBuyAmount: {
    amount: BigNumber.from(minBuyAmountAmount),
    amountInUnits: minBuyAmountAmountInUnits,
    amountInUSD: (!isUndefined(minBuyAmountAmountInUsd) && Number(minBuyAmountAmountInUsd)) || undefined,
  },
  gas: gas && {
    estimatedGas: BigNumber.from(gas.estimatedGas),
    estimatedCost: BigNumber.from(gas.estimatedCost),
    estimatedCostInUnits: gas.estimatedCostInUnits,
    estimatedCostInUSD: (!isUndefined(gas.estimatedCostInUSD) && Number(gas.estimatedCostInUSD)) || undefined,
    gasTokenSymbol: gas.gasTokenSymbol,
  },
  swapper: {
    allowanceTarget,
    name,
    logoURI,
    id,
  },
  type,
  tx,
});

export const getQuoteMetric = (quote: SwapOption, isBuyOrder: boolean) =>
  isBuyOrder
    ? `${formatCurrencyAmount(quote.sellAmount.amount, quote.sellToken)} ${quote.sellToken.symbol}`
    : `${formatCurrencyAmount(quote.buyAmount.amount, quote.buyToken)} ${quote.buyToken.symbol}`;
