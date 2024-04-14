import { SORT_MOST_PROFIT, SwapSortOptions } from '@constants/aggregator';
import { TokenAddress } from '@types';
import { isUndefined } from 'lodash';

export type Pair = {
  tokenA: TokenAddress;
  tokenB: TokenAddress;
};

export type Borrow = {
  token: TokenAddress;
  amount: bigint;
};

export type PairIndex = {
  indexTokenA: number;
  indexTokenB: number;
};

function assertValid(indexes: PairIndex[]) {
  for (const { indexTokenA, indexTokenB } of indexes) {
    if (indexTokenA === indexTokenB) {
      throw Error('Found duplicates in same pair');
    }
  }

  for (let i = 1; i < indexes.length; i += 1) {
    if (
      indexes[i - 1].indexTokenA === indexes[i].indexTokenA &&
      indexes[i - 1].indexTokenB === indexes[i].indexTokenB
    ) {
      throw Error('Found duplicates');
    }
  }
}

function getIndexes(pairs: Pair[], tokens: TokenAddress[]): PairIndex[] {
  return pairs
    .map(({ tokenA, tokenB }) => ({ indexTokenA: tokens.indexOf(tokenA), indexTokenB: tokens.indexOf(tokenB) }))
    .map(({ indexTokenA, indexTokenB }) => ({
      indexTokenA: Math.min(indexTokenA, indexTokenB),
      indexTokenB: Math.max(indexTokenA, indexTokenB),
    }))
    .sort((a, b) => a.indexTokenA - b.indexTokenA || a.indexTokenB - b.indexTokenB);
}

/** Given a list of pairs, returns a sorted list of the tokens involved */
function getUniqueTokens(pairs: Pair[], borrow: Borrow[]): TokenAddress[] {
  const tokenSet: TokenAddress[] = [];
  for (const { tokenA, tokenB } of pairs) {
    tokenSet.push(tokenA);
    tokenSet.push(tokenB);
  }

  for (const { token } of borrow) {
    tokenSet.push(token);
  }

  return [...tokenSet].sort((a, b) => a.localeCompare(b));
}

function buildBorrowArray(tokens: TokenAddress[], borrow: Borrow[]): bigint[] {
  const borrowMap = new Map(borrow.map(({ token, amount }) => [token, amount]));
  return tokens.map((token) => borrowMap.get(token) ?? 0n);
}

export function buildSwapInput(
  pairsToSwap: Pair[],
  borrow: Borrow[]
): { tokens: TokenAddress[]; pairIndexes: PairIndex[]; borrow: bigint[] } {
  const tokens: TokenAddress[] = getUniqueTokens(pairsToSwap, borrow);
  const pairIndexes = getIndexes(pairsToSwap, tokens);
  assertValid(pairIndexes);
  const toBorrow = buildBorrowArray(tokens, borrow);
  return { tokens, pairIndexes, borrow: toBorrow };
}

export const formatSwapDiffLabel = (label: string, sorting: SwapSortOptions, isBestQuote?: boolean) =>
  (isUndefined(isBestQuote) ? '' : isBestQuote ? '+' : '-') +
  (sorting === SORT_MOST_PROFIT ? '$' : '') +
  label +
  (sorting !== SORT_MOST_PROFIT ? '%' : '');
