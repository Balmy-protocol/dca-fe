import { BigNumber } from 'ethers';
import find from 'lodash/find';
import { FullPosition, GetNextSwapInfo, Position, Token } from 'types';
import { MAX_BI, STRING_SWAP_INTERVALS, SWAP_INTERVALS_MAP } from 'config/constants';

export const sortTokensByAddress = (tokenA: string, tokenB: string) => {
  let token0 = tokenA;
  let token1 = tokenB;

  if (tokenA > tokenB) {
    token0 = tokenB;
    token1 = tokenA;
  }

  return [token0, token1];
};

export const sortTokens = (tokenA: Token, tokenB: Token) => {
  let token0 = tokenA;
  let token1 = tokenB;

  if (tokenA.address > tokenB.address) {
    token0 = tokenB;
    token1 = tokenA;
  }

  return [token0, token1];
};

export const NO_SWAP_INFORMATION = -1;
export const NOTHING_TO_EXECUTE = 0;
export const HEALTHY = 1;
export const STALE = 2;

export const calculateStale: (
  lastSwapped: number | undefined,
  frequencyType: BigNumber,
  createdAt: number,
  nextSwapInformation: string | null
) => -1 | 0 | 1 | 2 = (
  lastSwapped = 0,
  frequencyType: BigNumber,
  createdAt: number,
  nextSwapInformation: string | null
) => {
  let isStale = false;
  if (!nextSwapInformation) {
    return NO_SWAP_INFORMATION;
  }

  const hasToExecute = BigNumber.from(nextSwapInformation).lt(MAX_BI);

  if (!hasToExecute) {
    return NOTHING_TO_EXECUTE;
  }

  const today = Math.floor(Date.now() / 1000);

  const foundFrequency = find(SWAP_INTERVALS_MAP, { value: frequencyType });

  if (!foundFrequency) {
    throw new Error('Frequency not found');
  }

  const timeframeToUse = BigNumber.from(lastSwapped).gte(BigNumber.from(createdAt)) ? lastSwapped : createdAt;

  const nextSwapAvailable = BigNumber.from(timeframeToUse).div(frequencyType).add(1).mul(frequencyType);
  isStale = BigNumber.from(today).gt(nextSwapAvailable.add(foundFrequency.staleValue));

  if (isStale) {
    return STALE;
  }
  return HEALTHY;
};

export const calculateStaleSwaps = (lastSwapped: number, frequencyType: BigNumber, createdAt: number) => {
  const today = BigNumber.from(Math.floor(Date.now() / 1000)).div(frequencyType);

  if (lastSwapped === 0) {
    return today.sub(BigNumber.from(createdAt).div(frequencyType).add(3));
  }

  const nextSwapAvailable = BigNumber.from(lastSwapped).div(frequencyType).add(3);
  return today.sub(nextSwapAvailable);
};

export const getFrequencyLabel = (frenquencyType: string, frequencyValue?: string) =>
  frequencyValue && BigNumber.from(frequencyValue).eq(BigNumber.from(1))
    ? STRING_SWAP_INTERVALS[frenquencyType as keyof typeof STRING_SWAP_INTERVALS].singular
    : STRING_SWAP_INTERVALS[frenquencyType as keyof typeof STRING_SWAP_INTERVALS].plural(
        parseInt(frequencyValue || '0', 10)
      );

export const getTimeFrequencyLabel = (frenquencyType: string, frequencyValue?: string) =>
  frequencyValue && BigNumber.from(frequencyValue).eq(BigNumber.from(1))
    ? STRING_SWAP_INTERVALS[frenquencyType as keyof typeof STRING_SWAP_INTERVALS].singularTime
    : STRING_SWAP_INTERVALS[frenquencyType as keyof typeof STRING_SWAP_INTERVALS].pluralTime(
        parseInt(frequencyValue || '0', 10)
      );

export const capitalizeFirstLetter = (toCap: string) => toCap.charAt(0).toUpperCase() + toCap.slice(1);

export function getURLFromQuery(query: string) {
  if (query.startsWith('https://')) {
    return query;
  }
  if (query.endsWith('.eth')) {
    return `https://${query}.link`;
  }
  return '';
}

export function fullPositionToMappedPosition(position: FullPosition): Position {
  return {
    from: position.from,
    to: position.to,
    user: position.user,
    swapInterval: BigNumber.from(position.swapInterval.interval),
    swapped: BigNumber.from(position.totalSwapped),
    rate: BigNumber.from(position.current.rate),
    toWithdraw: BigNumber.from(position.current.idleSwapped),
    remainingLiquidity: BigNumber.from(position.current.remainingLiquidity),
    remainingSwaps: BigNumber.from(position.current.remainingSwaps),
    withdrawn: BigNumber.from(position.totalWithdrawn),
    totalSwaps: BigNumber.from(position.totalSwaps),
    id: position.id,
    status: position.status,
    startedAt: parseInt(position.createdAtTimestamp, 10),
    totalDeposits: BigNumber.from(position.totalDeposits),
    pendingTransaction: '',
  };
}
