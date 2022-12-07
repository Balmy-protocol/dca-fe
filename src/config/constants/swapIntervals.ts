import { BigNumber } from 'ethers/lib/ethers';
import { Duration } from 'luxon';

export const ONE_MINUTE = BigNumber.from(60);
export const FIVE_MINUTES = ONE_MINUTE.mul(BigNumber.from(5));
export const FIFTEEN_MINUTES = FIVE_MINUTES.mul(BigNumber.from(3));
export const THIRTY_MINUTES = FIFTEEN_MINUTES.mul(BigNumber.from(2));
export const ONE_HOUR = THIRTY_MINUTES.mul(BigNumber.from(2));
export const FOUR_HOURS = ONE_HOUR.mul(BigNumber.from(4));
export const ONE_DAY = FOUR_HOURS.mul(BigNumber.from(6));
export const ONE_WEEK = ONE_DAY.mul(BigNumber.from(7));

export const SWAP_INTERVALS = {
  hour: ONE_HOUR,
  day: ONE_DAY,
  week: ONE_WEEK,
};

export const SWAP_INTERVALS_MAP = [
  {
    description: 'One minute',
    key: 1,
    value: ONE_MINUTE,
    staleValue: THIRTY_MINUTES,
  },
  {
    description: 'Five minutes',
    key: 2,
    value: FIVE_MINUTES,
    staleValue: ONE_HOUR,
  },
  {
    description: 'Fifteen minutes',
    key: 4,
    value: FIFTEEN_MINUTES,
    staleValue: ONE_HOUR,
  },
  {
    description: 'Thirty minutes',
    key: 8,
    value: THIRTY_MINUTES,
    staleValue: ONE_HOUR.mul(2),
  },
  {
    description: 'One hour',
    key: 16,
    value: ONE_HOUR,
    staleValue: ONE_HOUR.mul(12),
  },
  {
    description: 'Four hours',
    key: 32,
    value: FOUR_HOURS,
    staleValue: ONE_DAY,
  },
  {
    description: 'One day',
    key: 64,
    value: ONE_DAY,
    staleValue: ONE_DAY.mul(3),
  },
  {
    description: 'One week',
    key: 128,
    value: ONE_WEEK,
    staleValue: ONE_DAY.mul(3).add(ONE_WEEK),
  },
];

const toReadable = (left: number, frequency: number) => {
  const customDuration = Duration.fromMillis(frequency * 1000 * left);
  const asDays = customDuration.as('days');
  const asHours = customDuration.as('hours');
  const asMinutes = customDuration.as('minutes');

  if (asDays >= 1) {
    return `${parseFloat(asDays.toFixed(2))} days`;
  }

  if (asHours >= 1) {
    return `${parseFloat(asHours.toFixed(2))} hours`;
  }

  return `${parseFloat(asMinutes.toFixed(2))} minutes`;
};

export const STRING_SWAP_INTERVALS = {
  [ONE_MINUTE.toString()]: {
    singular: '1 minute (1 swap)',
    singularTime: '1 minute',
    plural: (left: number) => `${toReadable(left, ONE_MINUTE.toNumber())} (${left} swaps)`,
    pluralTime: (left: number) => `${toReadable(left, ONE_MINUTE.toNumber())}`,
    adverb: 'every 1 minute',
    every: 'every 1 minute',
    subject: 'swaps',
    singularSubject: 'minute',
  },
  [FIVE_MINUTES.toString()]: {
    singular: '5 minutes (1 swap)',
    singularTime: '5 minutes',
    plural: (left: number) => `${toReadable(left, FIVE_MINUTES.toNumber())} (${left} swaps)`,
    pluralTime: (left: number) => `${toReadable(left, FIVE_MINUTES.toNumber())}`,
    adverb: 'every 5 minutes',
    every: 'every 5 minutes',
    subject: 'swaps',
    singularSubject: '5 minutes',
  },
  [FIFTEEN_MINUTES.toString()]: {
    singular: '15 minutes (1 swap)',
    singularTime: '15 minutes',
    plural: (left: number) => `${toReadable(left, FIFTEEN_MINUTES.toNumber())} (${left} swaps)`,
    pluralTime: (left: number) => `${toReadable(left, FIFTEEN_MINUTES.toNumber())}`,
    adverb: 'every 15 minutes',
    every: 'every 15 minutes',
    subject: 'swaps',
    singularSubject: '15 minutes',
  },
  [THIRTY_MINUTES.toString()]: {
    singular: '30 minutes (1 swap)',
    singularTime: '30 minutes',
    plural: (left: number) => `${toReadable(left, THIRTY_MINUTES.toNumber())} (${left} swaps)`,
    pluralTime: (left: number) => `${toReadable(left, THIRTY_MINUTES.toNumber())}`,
    adverb: 'every 30 minutes',
    every: 'every 30 minutes',
    subject: 'swaps',
    singularSubject: '30 minutes',
  },
  [ONE_HOUR.toString()]: {
    singular: '1 hour (1 swap)',
    singularTime: '1 hour',
    plural: (left: number) => `${toReadable(left, ONE_HOUR.toNumber())} (${left} swaps)`,
    pluralTime: (left: number) => `${toReadable(left, ONE_HOUR.toNumber())}`,
    adverb: 'hourly',
    every: 'every hour',
    subject: 'swaps',
    singularSubject: 'hour',
  },
  [FOUR_HOURS.toString()]: {
    singular: '4 hours (1 swap)',
    singularTime: '4 hours',
    plural: (left: number) => `${toReadable(left, FOUR_HOURS.toNumber())} (${left} swaps)`,
    pluralTime: (left: number) => `${toReadable(left, FOUR_HOURS.toNumber())}`,
    adverb: 'every 4 hours',
    every: 'every 4 hours',
    subject: 'swaps',
    singularSubject: '4 hours',
  },
  [ONE_DAY.toString()]: {
    singular: '1 day (1 swap)',
    singularTime: '1 day',
    plural: (left: number) => `${toReadable(left, ONE_DAY.toNumber())} (${left} swaps)`,
    pluralTime: (left: number) => `${toReadable(left, ONE_DAY.toNumber())}`,
    every: 'every day',
    adverb: 'daily',
    subject: 'days',
    singularSubject: 'day',
  },
  [ONE_WEEK.toString()]: {
    singular: '1 week (1 swap)',
    singularTime: '1 week',
    plural: (left: number) => `${toReadable(left, ONE_WEEK.toNumber())} (${left} swaps)`,
    pluralTime: (left: number) => `${toReadable(left, ONE_WEEK.toNumber())}`,
    every: 'every week',
    adverb: 'weekly',
    subject: 'weeks',
    singularSubject: 'week',
  },
};
