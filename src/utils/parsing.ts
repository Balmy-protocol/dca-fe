import { BigNumber } from 'ethers';
import find from 'lodash/find';

const HOURS_IN_MONTH = BigNumber.from(732);
const DAYS_IN_WEEK = BigNumber.from(7);
const HOURS_IN_DAYS = BigNumber.from(24);
const MINUTES_IN_HOURS = BigNumber.from(60);
const SECONDS_IN_MINUTES = BigNumber.from(60);

export const DAY_IN_SECONDS = HOURS_IN_DAYS.mul(MINUTES_IN_HOURS).mul(SECONDS_IN_MINUTES);
export const WEEK_IN_SECONDS = DAYS_IN_WEEK.mul(HOURS_IN_DAYS).mul(MINUTES_IN_HOURS).mul(SECONDS_IN_MINUTES);
export const MONTH_IN_SECONDS = HOURS_IN_MONTH.mul(MINUTES_IN_HOURS).mul(SECONDS_IN_MINUTES);

export const SWAP_INTERVALS = {
  day: DAY_IN_SECONDS,
  week: WEEK_IN_SECONDS,
  month: MONTH_IN_SECONDS,
};

export const STRING_SWAP_INTERVALS = {
  [DAY_IN_SECONDS.toString()]: 'days',
  [WEEK_IN_SECONDS.toString()]: 'weeks',
  [MONTH_IN_SECONDS.toString()]: 'months',
};
