import { BigNumber } from 'ethers';

const HOURS_IN_MONTH = BigNumber.from(732);
const DAYS_IN_WEEK = BigNumber.from(7);
const HOURS_IN_DAYS = BigNumber.from(24);
const MINUTES_IN_HOURS = BigNumber.from(60);
const SECONDS_IN_MINUTES = BigNumber.from(60);

export const calculateSeconds = (type: string) => {
  let value = BigNumber.from(0);
  switch (type) {
    case 'Days':
      value = HOURS_IN_DAYS.mul(MINUTES_IN_HOURS).mul(SECONDS_IN_MINUTES);
      break;
    case 'Weeks':
      value = DAYS_IN_WEEK.mul(HOURS_IN_DAYS).mul(MINUTES_IN_HOURS).mul(SECONDS_IN_MINUTES);
      break;
    case 'Months':
      value = HOURS_IN_MONTH.mul(MINUTES_IN_HOURS).mul(SECONDS_IN_MINUTES);
      break;
  }

  return value;
};
