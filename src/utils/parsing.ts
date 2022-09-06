import { BigNumber } from 'ethers';
import find from 'lodash/find';
import { FullPosition, Position, Token } from 'types';
import { MAX_BI, POSITION_VERSION_3, STRING_SWAP_INTERVALS, SWAP_INTERVALS_MAP } from 'config/constants';

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
  nextSwapInformation: string | number | null
) => -1 | 0 | 1 | 2 = (
  lastSwapped = 0,
  frequencyType: BigNumber,
  createdAt: number,
  nextSwapInformation: string | number | null
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

export function fullPositionToMappedPosition(position: FullPosition, positionVersion?: string): Position {
  return {
    from: position.from,
    to: position.to,
    user: position.user,
    swapInterval: BigNumber.from(position.swapInterval.interval),
    swapped: BigNumber.from(position.totalSwapped),
    rate: BigNumber.from(position.current.rate),
    toWithdraw: BigNumber.from(position.current.toWithdraw),
    remainingLiquidity: BigNumber.from(position.current.remainingLiquidity),
    remainingSwaps: BigNumber.from(position.current.remainingSwaps),
    withdrawn: BigNumber.from(position.totalWithdrawn),
    totalSwaps: BigNumber.from(position.totalSwaps),
    id: `${position.id}-v${position.version || POSITION_VERSION_3}`,
    positionId: position.id,
    status: position.status,
    startedAt: parseInt(position.createdAtTimestamp, 10),
    totalDeposited: BigNumber.from(position.totalDeposited),
    totalExecutedSwaps: BigNumber.from(position.totalExecutedSwaps),
    pendingTransaction: '',
    version: position.version || positionVersion || POSITION_VERSION_3,
    chainId: position.chainId,
    pairLastSwappedAt: parseInt(position.createdAtTimestamp, 10),
    pairNextSwapAvailableAt: position.createdAtTimestamp,
  };
}

export const usdFormatter = (num: number) => {
  const si = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  // eslint-disable-next-line no-plusplus
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(3).replace(rx, '$1') + si[i].symbol;
};
