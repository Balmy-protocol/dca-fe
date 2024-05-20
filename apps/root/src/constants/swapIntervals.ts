import { Duration } from 'luxon';
import { defineMessage, IntlShape } from 'react-intl';
import { NETWORKS } from './addresses';
import { TimeString } from '@mean-finance/sdk';

export const ONE_MINUTE = 60n;
export const FIVE_MINUTES = ONE_MINUTE * 5n;
export const FIFTEEN_MINUTES = FIVE_MINUTES * 3n;
export const THIRTY_MINUTES = FIFTEEN_MINUTES * 2n;
export const ONE_HOUR = THIRTY_MINUTES * 2n;
export const FOUR_HOURS = ONE_HOUR * 4n;
export const ONE_DAY = FOUR_HOURS * 6n;
export const ONE_WEEK = ONE_DAY * 7n;

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
    staleValue: ONE_HOUR * 2n,
  },
  {
    description: 'One hour',
    key: 16,
    value: ONE_HOUR,
    staleValue: ONE_HOUR * 12n,
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
    staleValue: ONE_DAY * 3n,
  },
  {
    description: 'One week',
    key: 128,
    value: ONE_WEEK,
    staleValue: ONE_DAY * 3n + ONE_WEEK,
  },
];

export const STRING_SWAP_INTERVALS = {
  [ONE_MINUTE.toString()]: {
    singular: defineMessage({
      description: 'oneMinuteSingular',
      defaultMessage: '1 minute (1 swap)',
    }),
    singularTime: defineMessage({
      description: 'oneMinuteSingularTime',
      defaultMessage: '1 minute',
    }),
    plural: defineMessage({
      description: 'oneMinutePlural',
      defaultMessage: '{readable} ({left} swaps)',
    }),
    pluralTime: defineMessage({
      description: 'oneMinutePluralTime',
      defaultMessage: '{readable}',
    }),
    adverb: defineMessage({
      description: 'oneMinuteAdverb',
      defaultMessage: 'every 1 minute',
    }),
    every: defineMessage({
      description: 'oneMinuteEvery',
      defaultMessage: 'every 1 minute',
    }),
    subject: defineMessage({
      description: 'oneMinuteSubject',
      defaultMessage: 'swaps',
    }),
    singularSubject: defineMessage({
      description: 'oneMinuteSingularSubject',
      defaultMessage: 'minute',
    }),
  },
  [FIVE_MINUTES.toString()]: {
    singular: defineMessage({
      description: 'fiveMinutesSingular',
      defaultMessage: '5 minutes (1 swap)',
    }),
    singularTime: defineMessage({
      description: 'fiveMinutesSingularTime',
      defaultMessage: '5 minutes',
    }),
    plural: defineMessage({
      description: 'fiveMinutesPlural',
      defaultMessage: '{readable} ({left} swaps)',
    }),
    pluralTime: defineMessage({
      description: 'fiveMinutesPluralTime',
      defaultMessage: '{readable}',
    }),
    adverb: defineMessage({
      description: 'fiveMinutesAdverb',
      defaultMessage: 'every 5 minutes',
    }),
    every: defineMessage({
      description: 'fiveMinutesEvery',
      defaultMessage: 'every 5 minutes',
    }),
    subject: defineMessage({
      description: 'fiveMinutesSubject',
      defaultMessage: 'swaps',
    }),
    singularSubject: defineMessage({
      description: 'fiveMinutesSingularSubject',
      defaultMessage: '5 minutes',
    }),
  },
  [FIFTEEN_MINUTES.toString()]: {
    singular: defineMessage({
      description: 'fifteenMinutesSingular',
      defaultMessage: '15 minutes (1 swap)',
    }),
    singularTime: defineMessage({
      description: 'fifteenMinutesSingularTime',
      defaultMessage: '15 minutes',
    }),
    plural: defineMessage({
      description: 'fifteenMinutesPlural',
      defaultMessage: '{readable} ({left} swaps)',
    }),
    pluralTime: defineMessage({
      description: 'fifteenMinutesPluralTime',
      defaultMessage: '{readable}',
    }),
    adverb: defineMessage({
      description: 'fifteenMinutesAdverb',
      defaultMessage: 'every 15 minutes',
    }),
    every: defineMessage({
      description: 'fifteenMinutesEvery',
      defaultMessage: 'every 15 minutes',
    }),
    subject: defineMessage({
      description: 'fifteenMinutesSubject',
      defaultMessage: 'swaps',
    }),
    singularSubject: defineMessage({
      description: 'fifteenMinutesSingularSubject',
      defaultMessage: '15 minutes',
    }),
  },
  [THIRTY_MINUTES.toString()]: {
    singular: defineMessage({
      description: 'thirtyMinutesSingular',
      defaultMessage: '30 minutes (1 swap)',
    }),
    singularTime: defineMessage({
      description: 'thirtyMinutesSingularTime',
      defaultMessage: '30 minutes',
    }),
    plural: defineMessage({
      description: 'thirtyMinutesPlural',
      defaultMessage: '{readable} ({left} swaps)',
    }),
    pluralTime: defineMessage({
      description: 'thirtyMinutesPluralTime',
      defaultMessage: '{readable}',
    }),
    adverb: defineMessage({
      description: 'thiertyMinutesAdverb',
      defaultMessage: 'every 30 minutes',
    }),
    every: defineMessage({
      description: 'thirtyMinutesEvery',
      defaultMessage: 'every 30 minutes',
    }),
    subject: defineMessage({
      description: 'thirtyMinutesSubject',
      defaultMessage: 'swaps',
    }),
    singularSubject: defineMessage({
      description: 'thirtyMinutesSingularSubject',
      defaultMessage: '30 minutes',
    }),
  },
  [ONE_HOUR.toString()]: {
    singular: defineMessage({
      description: 'oneHourSingular',
      defaultMessage: '1 hour (1 swap)',
    }),
    singularTime: defineMessage({
      description: 'oneHourSingularTime',
      defaultMessage: '1 hour',
    }),
    plural: defineMessage({
      description: 'oneHourPlural',
      defaultMessage: '{readable} ({left} swaps)',
    }),
    pluralTime: defineMessage({
      description: 'oneHourPluralTime',
      defaultMessage: '{readable}',
    }),
    adverb: defineMessage({
      description: 'oneHourAdverb',
      defaultMessage: 'hourly',
    }),
    every: defineMessage({
      description: 'oneHourEvery',
      defaultMessage: 'every hour',
    }),
    subject: defineMessage({
      description: 'oneHourSubject',
      defaultMessage: 'swaps',
    }),
    singularSubject: defineMessage({
      description: 'oneHourSingularSubject',
      defaultMessage: 'hour',
    }),
  },
  [FOUR_HOURS.toString()]: {
    singular: defineMessage({
      description: 'fourHoursSingular',
      defaultMessage: '4 hours (1 swap)',
    }),
    singularTime: defineMessage({
      description: 'fourHoursSingularTime',
      defaultMessage: '4 hours',
    }),
    plural: defineMessage({
      description: 'fourHoursPlural',
      defaultMessage: '{readable} ({left} swaps)',
    }),
    pluralTime: defineMessage({
      description: 'fourHoursPluralTime',
      defaultMessage: '{readable}',
    }),
    adverb: defineMessage({
      description: 'fourHoursAdverb',
      defaultMessage: 'every 4 hours',
    }),
    every: defineMessage({
      description: 'fourHoursEvery',
      defaultMessage: 'every 4 hours',
    }),
    subject: defineMessage({
      description: 'fourHoursSubject',
      defaultMessage: 'swaps',
    }),
    singularSubject: defineMessage({
      description: 'fourHoursSingularSubject',
      defaultMessage: '4 hours',
    }),
  },
  [ONE_DAY.toString()]: {
    singular: defineMessage({
      description: 'oneDaySingular',
      defaultMessage: '1 day (1 swap)',
    }),
    singularTime: defineMessage({
      description: 'oneDaySingularTime',
      defaultMessage: '1 day',
    }),
    plural: defineMessage({
      description: 'oneDayPlural',
      defaultMessage: '{readable} ({left} swaps)',
    }),
    pluralTime: defineMessage({
      description: 'oneDayPluralTime',
      defaultMessage: '{readable}',
    }),
    adverb: defineMessage({
      description: 'oneDayAdverb',
      defaultMessage: 'daily',
    }),
    every: defineMessage({
      description: 'oneDayEvery',
      defaultMessage: 'every day',
    }),
    subject: defineMessage({
      description: 'oneDaySubject',
      defaultMessage: 'days',
    }),
    singularSubject: defineMessage({
      description: 'oneDaySingularSubject',
      defaultMessage: 'day',
    }),
  },
  [ONE_WEEK.toString()]: {
    singular: defineMessage({
      description: 'oneWeekSingular',
      defaultMessage: '1 week (1 swap)',
    }),
    singularTime: defineMessage({
      description: 'oneWeekSingularTime',
      defaultMessage: '1 week',
    }),
    plural: defineMessage({
      description: 'oneWeekPlural',
      defaultMessage: '{readable} ({left} swaps)',
    }),
    pluralTime: defineMessage({
      description: 'oneWeekPluralTime',
      defaultMessage: '{readable}',
    }),
    adverb: defineMessage({
      description: 'oneWeekAdverb',
      defaultMessage: 'weekly',
    }),
    every: defineMessage({
      description: 'oneWeekEvery',
      defaultMessage: 'every week',
    }),
    subject: defineMessage({
      description: 'oneWeekSubject',
      defaultMessage: 'weeks',
    }),
    singularSubject: defineMessage({
      description: 'oneWeekSingularSubject',
      defaultMessage: 'week',
    }),
  },
};

export const toReadable = (left: number, frequency: number, intl: IntlShape) => {
  const customDuration = Duration.fromMillis(frequency * 1000 * left);
  const asDays = customDuration.as('days');
  const asHours = customDuration.as('hours');
  const asMinutes = customDuration.as('minutes');

  if (asDays >= 1) {
    return `${parseFloat(asDays.toFixed(2))} ${intl.formatMessage(
      defineMessage({ description: 'days', defaultMessage: 'days' })
    )}`;
  }

  if (asHours >= 1) {
    return `${parseFloat(asHours.toFixed(2))} ${intl.formatMessage(
      defineMessage({ description: 'hours', defaultMessage: 'hours' })
    )}`;
  }

  return `${parseFloat(asMinutes.toFixed(2))} ${intl.formatMessage(
    defineMessage({ description: 'minutes', defaultMessage: 'minutes' })
  )}`;
};

export const DISABLED_FREQUENCIES_BY_TOKEN: Record<string, string[]> = {
  '0xbd1fe73e1f12bd2bc237de9b626f056f21f86427': [FOUR_HOURS.toString()],
  '0xf2f77fe7b8e66571e0fca7104c4d670bf1c8d722': [FOUR_HOURS.toString()],
};

export const DISABLED_FREQUENCIES_BY_CHAIN: Record<number, string[]> = {
  [NETWORKS.polygon.chainId]: [FOUR_HOURS.toString()],
};

export const shouldEnableFrequency = (
  frequency: string,
  fromAddress?: string,
  toAddress?: string,
  chainId?: number
) => {
  const filteredTokens = Object.keys(DISABLED_FREQUENCIES_BY_TOKEN);
  const filteredChains = Object.keys(DISABLED_FREQUENCIES_BY_CHAIN);

  if (
    !filteredTokens.includes(fromAddress || '') &&
    !filteredTokens.includes(toAddress || '') &&
    !filteredChains.includes(chainId?.toString() || '')
  ) {
    return true;
  }

  if (
    chainId &&
    filteredChains.includes(chainId.toString()) &&
    DISABLED_FREQUENCIES_BY_CHAIN[chainId].includes(frequency)
  ) {
    return false;
  }

  if (
    fromAddress &&
    filteredTokens.includes(fromAddress) &&
    DISABLED_FREQUENCIES_BY_TOKEN[fromAddress].includes(frequency)
  ) {
    return false;
  }

  if (toAddress && filteredTokens.includes(toAddress) && DISABLED_FREQUENCIES_BY_TOKEN[toAddress].includes(frequency)) {
    return false;
  }

  return true;
};

export const FREQUENCY_TO_PERIOD: { [key: string]: TimeString } = {
  [ONE_MINUTE.toString()]: '1m',
  [FIVE_MINUTES.toString()]: '1m',
  [FIFTEEN_MINUTES.toString()]: '5m',
  [THIRTY_MINUTES.toString()]: '15m',
  [ONE_HOUR.toString()]: '30m',
  [FOUR_HOURS.toString()]: '1h',
  [ONE_DAY.toString()]: '4h',
  [ONE_WEEK.toString()]: '1d',
};

export const FREQUENCY_TO_MULTIPLIER = {
  [ONE_MINUTE.toString()]: 1,
  [FIVE_MINUTES.toString()]: 5,
  [FIFTEEN_MINUTES.toString()]: 2,
  [THIRTY_MINUTES.toString()]: 2,
  [ONE_HOUR.toString()]: 2,
  [FOUR_HOURS.toString()]: 4,
  [ONE_DAY.toString()]: 6,
  [ONE_WEEK.toString()]: 7,
};

export const FREQUENCY_TO_FORMAT = {
  [ONE_MINUTE.toString()]: 't',
  [FIVE_MINUTES.toString()]: 't',
  [FIFTEEN_MINUTES.toString()]: 't',
  [THIRTY_MINUTES.toString()]: 't',
  [ONE_HOUR.toString()]: 't',
  [FOUR_HOURS.toString()]: 't',
  [ONE_DAY.toString()]: 'MMM d t',
  [ONE_WEEK.toString()]: 'MMM d t',
};
