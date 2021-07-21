import { BigNumber } from 'ethers';

const HOURS_IN_MONTH = BigNumber.from(732);
const DAYS_IN_WEEK = BigNumber.from(7);
const HOURS_IN_DAYS = BigNumber.from(24);
const MINUTES_IN_HOURS = BigNumber.from(60);
const SECONDS_IN_MINUTES = BigNumber.from(60);

export const FIVE_MINUTES_IN_SECONDS = SECONDS_IN_MINUTES.mul(BigNumber.from(5));
export const DAY_IN_SECONDS = HOURS_IN_DAYS.mul(MINUTES_IN_HOURS).mul(SECONDS_IN_MINUTES);
export const WEEK_IN_SECONDS = DAYS_IN_WEEK.mul(HOURS_IN_DAYS).mul(MINUTES_IN_HOURS).mul(SECONDS_IN_MINUTES);
export const MONTH_IN_SECONDS = HOURS_IN_MONTH.mul(MINUTES_IN_HOURS).mul(SECONDS_IN_MINUTES);

export const SWAP_INTERVALS = {
  day: DAY_IN_SECONDS,
  week: WEEK_IN_SECONDS,
  month: MONTH_IN_SECONDS,
};

export const STRING_SWAP_INTERVALS = {
  [FIVE_MINUTES_IN_SECONDS.toString()]: {
    singular: '5 minutes',
    plural: '5 minutes',
    adverb: '5 minutely',
  },
  [DAY_IN_SECONDS.toString()]: {
    singular: 'day',
    plural: 'days',
    adverb: 'daily',
  },
  [WEEK_IN_SECONDS.toString()]: {
    singular: 'week',
    plural: 'weeks',
    adverb: 'weekly',
  },
  [MONTH_IN_SECONDS.toString()]: {
    singular: 'month',
    plural: 'months',
    adverb: 'monthly',
  },
};

export const sortTokens = (tokenA: string, tokenB: string) => {
  let token0 = tokenA;
  let token1 = tokenB;

  if (tokenA > tokenB) {
    token0 = tokenB;
    token1 = tokenA;
  }

  return [token0, token1];
};

export const calculateStale = (lastSwapped: number, frequencyType: BigNumber, createdAt: number) => {
  const today = Math.floor(Date.now() / 1000);

  if (lastSwapped === 0) {
    return BigNumber.from(today).gt(BigNumber.from(createdAt).add(frequencyType).add(DAY_IN_SECONDS.mul(3)));
  }

  const nextSwapAvailable = BigNumber.from(lastSwapped).div(frequencyType).add(1).mul(frequencyType);
  return BigNumber.from(today).gt(nextSwapAvailable.add(frequencyType).add(DAY_IN_SECONDS.mul(3)));
};

export const getFrequencyLabel = (frenquencyType: string, frequencyValue?: string) =>
  frequencyValue && BigNumber.from(frequencyValue).eq(BigNumber.from(1))
    ? STRING_SWAP_INTERVALS[frenquencyType as keyof typeof STRING_SWAP_INTERVALS].singular
    : STRING_SWAP_INTERVALS[frenquencyType as keyof typeof STRING_SWAP_INTERVALS].plural;
