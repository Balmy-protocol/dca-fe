import { BigNumber } from 'ethers';
import find from 'lodash/find';
import { FullPosition, GetNextSwapInfo, Position, Token } from 'types';
import { STRING_SWAP_INTERVALS, ONE_DAY } from 'config/constants';

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

export const calculateStale: (
  lastSwapped: number | undefined,
  frequencyType: BigNumber,
  createdAt: number,
  nextSwapInformation: GetNextSwapInfo | null
) => -1 | 0 | 1 | 2 = (
  lastSwapped = 0,
  frequencyType: BigNumber,
  createdAt: number,
  nextSwapInformation: GetNextSwapInfo | null
) => {
  let isStale = false;
  if (!nextSwapInformation) {
    return -1;
  }

  const hasToExecute = find(nextSwapInformation.swapsToPerform, { interval: frequencyType.toNumber() });

  const today = Math.floor(Date.now() / 1000);

  if (lastSwapped === 0) {
    isStale = BigNumber.from(today).gt(BigNumber.from(createdAt).add(frequencyType).add(ONE_DAY.mul(3)));
  } else {
    const nextSwapAvailable = BigNumber.from(lastSwapped).div(frequencyType).add(1).mul(frequencyType);
    isStale = BigNumber.from(today).gt(nextSwapAvailable.add(frequencyType).add(ONE_DAY.mul(3)));
  }

  if (isStale) {
    if (!hasToExecute) {
      return 0;
    }

    return 2;
  }
  return 1;
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
    : STRING_SWAP_INTERVALS[frenquencyType as keyof typeof STRING_SWAP_INTERVALS].plural;

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
