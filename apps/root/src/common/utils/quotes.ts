import { SORT_LEAST_GAS, SORT_MOST_PROFIT, SORT_MOST_RETURN, SwapSortOptions } from '@constants/aggregator';
import { Address, formatUnits, parseUnits } from 'viem';
import { v4 as uuidv4 } from 'uuid';
import isUndefined from 'lodash/isUndefined';
import {
  EstimatedQuoteResponse,
  EstimatedQuoteResponseWithTx,
  QuoteResponse,
  QuoteResponseWithTx,
  QuoteTransaction,
} from '@balmy/sdk';
import { QuoteErrors, SwapOption, SwapOptionWithTx, Token } from '@types';
import { defineMessage, useIntl } from 'react-intl';

import { formatCurrencyAmount, parseNumberUsdPriceToBigInt, parseUsdPrice, toToken } from './currency';

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
  let betterBy: bigint | null | undefined = null;

  if (sorting === SORT_MOST_RETURN) {
    if (isBuyOrder) {
      betterBy =
        secondQuote &&
        bestQuote &&
        ((secondQuote.sellAmount.amount - bestQuote.sellAmount.amount) * 10n ** 18n * 100n) /
          secondQuote.sellAmount.amount;
    } else {
      betterBy =
        secondQuote &&
        bestQuote &&
        ((bestQuote.buyAmount.amount - secondQuote.buyAmount.amount) * 10n ** 18n * 100n) /
          secondQuote.buyAmount.amount;
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
      ((secondQuote.gas.estimatedCost - bestQuote.gas.estimatedCost) * 10n ** 18n * 100n) /
        secondQuote.gas.estimatedCost;
  }

  return betterBy;
};

export const getWorseBy = (
  bestQuote: Nullable<SwapOption>,
  secondQuote: Nullable<SwapOption>,
  sorting: SwapSortOptions,
  isBuyOrder: boolean
) => {
  let worseBy: bigint | null | undefined = null;

  if (sorting === SORT_MOST_RETURN) {
    if (isBuyOrder) {
      worseBy =
        secondQuote &&
        bestQuote &&
        ((secondQuote.sellAmount.amount - bestQuote.sellAmount.amount) * 10n ** 18n * 100n) /
          bestQuote.sellAmount.amount;
    } else {
      worseBy =
        secondQuote &&
        bestQuote &&
        ((bestQuote.buyAmount.amount - secondQuote.buyAmount.amount) * 10n ** 18n * 100n) / bestQuote.buyAmount.amount;
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
      ((secondQuote.gas.estimatedCost - bestQuote.gas.estimatedCost) * 10n ** 18n * 100n) / bestQuote.gas.estimatedCost;
  }

  return worseBy;
};

export const quoteResponseToSwapOption: (
  option: (EstimatedQuoteResponse | QuoteResponseWithTx) & {
    estimatedTx?: QuoteTransaction;
    chainId: number;
    transferTo?: Nullable<Address>;
  }
) => SwapOption = ({
  sellToken,
  buyToken,
  sellAmount,
  buyAmount,
  maxSellAmount,
  minBuyAmount,
  gas,
  source,
  type,
  estimatedTx,
  chainId,
  customData,
  transferTo,
  ...rest
}) => ({
  id: uuidv4(),
  chainId,
  transferTo: transferTo || null,
  sellToken: {
    ...sellToken,
    ...toToken({ ...sellToken, chainId }),
  },
  buyToken: {
    ...buyToken,
    ...toToken({ ...buyToken, chainId }),
  },
  sellAmount: {
    ...sellAmount,
    amount: BigInt(sellAmount.amount),
    amountInUSD: (!isUndefined(sellAmount.amountInUSD) && Number(sellAmount.amountInUSD)) || undefined,
  },
  buyAmount: {
    ...buyAmount,
    amount: BigInt(buyAmount.amount),
    amountInUSD: (!isUndefined(buyAmount.amountInUSD) && Number(buyAmount.amountInUSD)) || undefined,
  },
  maxSellAmount: {
    ...maxSellAmount,
    amount: BigInt(maxSellAmount.amount),
    amountInUSD: (!isUndefined(maxSellAmount.amountInUSD) && Number(maxSellAmount.amountInUSD)) || undefined,
  },
  minBuyAmount: {
    ...minBuyAmount,
    amount: BigInt(minBuyAmount.amount),
    amountInUSD: (!isUndefined(minBuyAmount.amountInUSD) && Number(minBuyAmount.amountInUSD)) || undefined,
  },
  gas: gas && {
    ...gas,
    estimatedGas: BigInt(gas.estimatedGas),
    estimatedCost: BigInt(gas.estimatedCost),
    estimatedCostInUnits: gas.estimatedCostInUnits,
    estimatedCostInUSD: (!isUndefined(gas.estimatedCostInUSD) && Number(gas.estimatedCostInUSD)) || undefined,
    gasTokenSymbol: gas.gasTokenSymbol,
    gasTokenPrice: gas.gasTokenPrice,
  },
  swapper: source,
  type,
  customData,
  ...('tx' in rest
    ? { tx: rest.tx }
    : { tx: estimatedTx || ('estimatedTx' in customData ? (customData.estimatedTx as QuoteTransaction) : undefined) }),
});

export const swapOptionToQuoteResponse: (option: SwapOption, recipient: Address) => QuoteResponse = (
  {
    sellToken,
    buyToken,
    sellAmount,
    buyAmount,
    maxSellAmount,
    minBuyAmount,
    gas,
    type,
    swapper,
    chainId,
    transferTo,
    customData,
    tx,
  },
  recipient
) => ({
  id: uuidv4(),
  chainId,
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
    amount: BigInt(sellAmount.amount),
    amountInUSD: (!isUndefined(sellAmount.amountInUSD) && Number(sellAmount.amountInUSD)).toString() || undefined,
  },
  buyAmount: {
    ...buyAmount,
    amount: BigInt(buyAmount.amount),
    amountInUSD: (!isUndefined(buyAmount.amountInUSD) && Number(buyAmount.amountInUSD)).toString() || undefined,
  },
  maxSellAmount: {
    ...maxSellAmount,
    amount: BigInt(maxSellAmount.amount),
    amountInUSD: (!isUndefined(maxSellAmount.amountInUSD) && Number(maxSellAmount.amountInUSD)).toString() || undefined,
  },
  minBuyAmount: {
    ...minBuyAmount,
    amount: BigInt(minBuyAmount.amount),
    amountInUSD: (!isUndefined(minBuyAmount.amountInUSD) && Number(minBuyAmount.amountInUSD)).toString() || undefined,
  },
  gas: gas && {
    ...gas,
    estimatedGas: BigInt(gas.estimatedGas),
    estimatedCost: BigInt(gas.estimatedCost),
    estimatedCostInUnits: gas.estimatedCostInUnits,
    estimatedCostInUSD:
      (!isUndefined(gas.estimatedCostInUSD) && Number(gas.estimatedCostInUSD)).toString() || undefined,
    gasTokenSymbol: gas.gasTokenSymbol,
    gasTokenPrice: gas.gasTokenPrice,
  },
  source: swapper,
  type,
  accounts: {
    takerAddress: transferTo || recipient,
    recipient,
  },
  customData,
  tx,
});

export const getQuoteMetric = (quote: SwapOption, isBuyOrder: boolean, intl: ReturnType<typeof useIntl>) =>
  isBuyOrder
    ? `${formatCurrencyAmount({ amount: quote.sellAmount.amount, token: quote.sellToken, intl })} ${
        quote.sellToken.symbol
      }`
    : `${formatCurrencyAmount({ amount: quote.buyAmount.amount, token: quote.buyToken, intl })} ${
        quote.buyToken.symbol
      }`;

export const swapOptionToEstimatedQuoteResponseWithTx: (option: SwapOptionWithTx) => EstimatedQuoteResponseWithTx = (
  option
) => ({
  ...option,
  source: option.swapper,
  sellAmount: {
    ...option.sellAmount,
    amount: option.sellAmount.amount,
    amountInUSD: option.sellAmount.amountInUSD?.toString(),
  },
  maxSellAmount: {
    ...option.maxSellAmount,
    amount: option.maxSellAmount.amount,
    amountInUSD: option.maxSellAmount.amountInUSD?.toString(),
  },
  buyAmount: {
    ...option.buyAmount,
    amount: option.buyAmount.amount,
    amountInUSD: option.buyAmount.amountInUSD?.toString(),
  },
  minBuyAmount: {
    ...option.minBuyAmount,
    amount: option.minBuyAmount.amount,
    amountInUSD: option.minBuyAmount.amountInUSD?.toString(),
  },
  gas: option.gas
    ? {
        ...option.gas,
        estimatedGas: option.gas.estimatedGas,
        estimatedCost: option.gas.estimatedCost,
        estimatedCostInUSD: option.gas.estimatedCostInUSD?.toString(),
      }
    : undefined,
  customData: {
    estimatedTx: option.tx,
    tx: option.tx,
  },
});

export const setSwapOptionMaxSellAmount = (option: SwapOption, totalAmountToApprove: bigint) => ({
  ...option,
  maxSellAmount: {
    amount: totalAmountToApprove,
    amountInUnits: formatUnits(totalAmountToApprove, option.sellToken.decimals),
    amountInUSD: parseUsdPrice(
      option.sellToken,
      totalAmountToApprove,
      parseNumberUsdPriceToBigInt(option.sellToken.price)
    ),
  },
});

export const setEstimatedQuoteResponseMaxSellAmount = (
  option: EstimatedQuoteResponseWithTx,
  totalAmountToApprove: bigint
) => ({
  ...option,
  maxSellAmount: {
    amount: totalAmountToApprove,
    amountInUnits: formatUnits(totalAmountToApprove, option.sellToken.decimals),
    amountInUSD: parseUsdPrice(
      option.sellToken as Token,
      totalAmountToApprove,
      parseNumberUsdPriceToBigInt(option.sellToken.price)
    ).toString(),
  },
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
