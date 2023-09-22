import { SORT_LEAST_GAS, SORT_MOST_PROFIT, SORT_MOST_RETURN, SwapSortOptions } from '@constants/aggregator';
import { parseUnits } from '@ethersproject/units';
import { v4 as uuidv4 } from 'uuid';
import isUndefined from 'lodash/isUndefined';
import { EstimatedQuoteResponseWithTx, QuoteResponse, QuoteTransaction } from '@mean-finance/sdk';
import { QuoteErrors, SwapOption, SwapOptionWithTx } from '@types';
import { defineMessage } from 'react-intl';
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
      return addRecommended
        ? defineMessage({
            description: 'betterByLabelMostReturnBuyOrderWithRecommended',
            defaultMessage: 'less spent than second best',
          })
        : defineMessage({
            description: 'betterByLabelMostReturnBuyOrderWithoutRecommended',
            defaultMessage: 'less spent',
          });
    }

    return addRecommended
      ? defineMessage({
          description: 'betterByLabelMostReturnSellOrderWithRecommended',
          defaultMessage: 'more received than second best',
        })
      : defineMessage({
          description: 'betterByLabelMostReturnSellOrderWithoutRecommended',
          defaultMessage: 'more received',
        });
  }
  if (sorting === SORT_MOST_PROFIT) {
    return addRecommended
      ? defineMessage({
          description: 'betterByLabelMostProfitWithRecommended',
          defaultMessage: 'more profitable than second best',
        })
      : defineMessage({ description: 'betterByLabelMostProfitWithoutRecommended', defaultMessage: 'more profitable' });
  }

  if (sorting === SORT_LEAST_GAS) {
    return addRecommended
      ? defineMessage({
          description: 'betterByLabelLeastGasWithRecommended',
          defaultMessage: 'least gas used than second best',
        })
      : defineMessage({ description: 'betterByLabelLeastGasWithoutRecommended', defaultMessage: 'least gas used' });
  }

  return defineMessage({ description: 'empty', defaultMessage: '' });
};

export const getWorseByLabel = (sorting: SwapSortOptions, isBuyOrder: boolean, addRecommended = false) => {
  if (sorting === SORT_MOST_RETURN) {
    if (isBuyOrder) {
      return addRecommended
        ? defineMessage({
            description: 'worseByLabelMostReturnBuyOrderWithRecommended',
            defaultMessage: 'more spent than recommended',
          })
        : defineMessage({
            description: 'worseByLabelMostReturnBuyOrderWithoutRecommended',
            defaultMessage: 'more spent',
          });
    }

    return addRecommended
      ? defineMessage({
          description: 'worseByLabelMostReturnSellOrderWithRecommended',
          defaultMessage: 'less received than recommended',
        })
      : defineMessage({
          description: 'worseByLabelMostReturnSellOrderWithoutRecommended',
          defaultMessage: 'less received',
        });
  }
  if (sorting === SORT_MOST_PROFIT) {
    return addRecommended
      ? defineMessage({
          description: 'worseByLabelMostProfitWithRecommended',
          defaultMessage: 'less profitable than recommended',
        })
      : defineMessage({ description: 'worseByLabelMostProfitWithoutRecommended', defaultMessage: 'less profitable' });
  }

  if (sorting === SORT_LEAST_GAS) {
    return addRecommended
      ? defineMessage({
          description: 'worseByLabelLeastGasWithRecommended',
          defaultMessage: 'more gas used than recommended',
        })
      : defineMessage({ description: 'worseByLabelLeastGasWithoutRecommended', defaultMessage: 'more gas used' });
  }

  return defineMessage({ description: 'empty', defaultMessage: '' });
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
          .mul(100)
          .div(secondQuote.sellAmount.amount);
    } else {
      betterBy =
        secondQuote &&
        bestQuote &&
        bestQuote.buyAmount.amount
          .sub(secondQuote.buyAmount.amount)
          .mul(BigNumber.from(10).pow(18))
          .mul(100)
          .div(secondQuote.buyAmount.amount);
    }
  } else if (sorting === SORT_MOST_PROFIT) {
    const profitBest = calculateProfit(bestQuote);
    const profitSecond = calculateProfit(secondQuote);
    if (!isUndefined(profitBest) && !isUndefined(profitSecond)) {
      betterBy = parseUnits(parseFloat((profitBest - profitSecond).toFixed(20)).toString(), 18);
      // betterBy = parseUnits(Math.abs(((profitBest - profitSecond) / profitSecond) * 100).toString(), 18);
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
        .mul(100)
        .div(secondQuote.gas.estimatedCost);
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
          .mul(100)
          .div(bestQuote.sellAmount.amount);
    } else {
      worseBy =
        secondQuote &&
        bestQuote &&
        bestQuote.buyAmount.amount
          .sub(secondQuote.buyAmount.amount)
          .mul(BigNumber.from(10).pow(18))
          .mul(100)
          .div(bestQuote.buyAmount.amount);
    }
  } else if (sorting === SORT_MOST_PROFIT) {
    const profitBest = calculateProfit(bestQuote);
    const profitSecond = calculateProfit(secondQuote);
    if (profitBest && profitSecond) {
      worseBy = parseUnits(parseFloat(Math.abs(profitSecond - profitBest).toFixed(20)).toString(), 18);
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
        .mul(100)
        .div(bestQuote.gas.estimatedCost);
  }

  return worseBy;
};

export const quoteResponseToSwapOption: (option: QuoteResponse & { estimatedTx?: QuoteTransaction }) => SwapOption = ({
  sellToken,
  buyToken,
  sellAmount,
  buyAmount,
  maxSellAmount,
  minBuyAmount,
  gas,
  source,
  type,
  tx,
  recipient,
  estimatedTx,
}) => ({
  id: uuidv4(),
  transferTo: recipient,
  sellToken: {
    ...sellToken,
    ...toToken(sellToken),
  },
  buyToken: {
    ...buyToken,
    ...toToken(buyToken),
  },
  sellAmount: {
    ...sellAmount,
    amount: BigNumber.from(sellAmount.amount),
    amountInUSD: (!isUndefined(sellAmount.amountInUSD) && Number(sellAmount.amountInUSD)) || undefined,
  },
  buyAmount: {
    ...buyAmount,
    amount: BigNumber.from(buyAmount.amount),
    amountInUSD: (!isUndefined(buyAmount.amountInUSD) && Number(buyAmount.amountInUSD)) || undefined,
  },
  maxSellAmount: {
    ...maxSellAmount,
    amount: BigNumber.from(maxSellAmount.amount),
    amountInUSD: (!isUndefined(maxSellAmount.amountInUSD) && Number(maxSellAmount.amountInUSD)) || undefined,
  },
  minBuyAmount: {
    ...minBuyAmount,
    amount: BigNumber.from(minBuyAmount.amount),
    amountInUSD: (!isUndefined(minBuyAmount.amountInUSD) && Number(minBuyAmount.amountInUSD)) || undefined,
  },
  gas: gas && {
    ...gas,
    estimatedGas: BigNumber.from(gas.estimatedGas),
    estimatedCost: BigNumber.from(gas.estimatedCost),
    estimatedCostInUnits: gas.estimatedCostInUnits,
    estimatedCostInUSD: (!isUndefined(gas.estimatedCostInUSD) && Number(gas.estimatedCostInUSD)) || undefined,
    gasTokenSymbol: gas.gasTokenSymbol,
    gasTokenPrice: gas.gasTokenPrice,
  },
  swapper: source,
  type,
  tx: tx || estimatedTx,
});

export const getQuoteMetric = (quote: SwapOption, isBuyOrder: boolean) =>
  isBuyOrder
    ? `${formatCurrencyAmount(quote.sellAmount.amount, quote.sellToken)} ${quote.sellToken.symbol}`
    : `${formatCurrencyAmount(quote.buyAmount.amount, quote.buyToken)} ${quote.buyToken.symbol}`;

export const swapOptionToEstimatedQuoteResponseWithTx: (option: SwapOptionWithTx) => EstimatedQuoteResponseWithTx = (
  option
) => ({
  ...option,
  source: option.swapper,
  sellAmount: {
    ...option.sellAmount,
    amount: option.sellAmount.amount.toString(),
    amountInUSD: option.sellAmount.amountInUSD?.toString(),
  },
  maxSellAmount: {
    ...option.maxSellAmount,
    amount: option.maxSellAmount.amount.toString(),
    amountInUSD: option.maxSellAmount.amountInUSD?.toString(),
  },
  buyAmount: {
    ...option.buyAmount,
    amount: option.buyAmount.amount.toString(),
    amountInUSD: option.buyAmount.amountInUSD?.toString(),
  },
  minBuyAmount: {
    ...option.minBuyAmount,
    amount: option.minBuyAmount.amount.toString(),
    amountInUSD: option.minBuyAmount.amountInUSD?.toString(),
  },
  gas: option.gas
    ? {
        ...option.gas,
        estimatedGas: option.gas.estimatedGas.toString(),
        estimatedCost: option.gas.estimatedCost.toString(),
        estimatedCostInUSD: option.gas.estimatedCostInUSD?.toString(),
      }
    : undefined,
  estimatedTx: option.tx,
});

export const categorizeError = (errorMsg: string): QuoteErrors => {
  if (errorMsg.includes('timeouted')) {
    return QuoteErrors.TIMEOUT;
  }
  if (errorMsg.includes('Invalid or unregistered referral code')) {
    return QuoteErrors.REFERRAL_CODE;
  }
  if (errorMsg.includes('Cannot convert undefined to a BigInt')) {
    return QuoteErrors.BIGINT_CONVERSION;
  }
  if (errorMsg.includes('Network request failed')) {
    return QuoteErrors.NETWORK_REQUEST;
  }
  return QuoteErrors.UNKNOWN;
};
