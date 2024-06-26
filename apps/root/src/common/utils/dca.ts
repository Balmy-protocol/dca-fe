import { STABLE_COINS, STRING_SWAP_INTERVALS } from '@constants';
import { Position } from 'common-types';
import { IntlShape, defineMessage } from 'react-intl';
import { calculateAvgBuyPrice } from './parsing';
import { formatCurrencyAmount } from './currency';
import { DateTime } from 'luxon';
import { capitalize } from 'lodash';

type TweetSubContent = {
  content: string;
  prevLineBreaks?: number;
  shouldNotInsert?: boolean;
};

export const getDcaTweetContent = ({
  position,
  intl,
}: {
  position?: Position;
  intl: IntlShape;
}): { twitterText: string; twitterShareUrl: string } | undefined => {
  if (!position) {
    return;
  }

  const { averageBuyPrice, tokenFromAverage, tokenToAverage } = calculateAvgBuyPrice(position);

  const mainTitle: TweetSubContent = {
    content: intl.formatMessage(
      defineMessage({
        description: 'dca.position-details.twitter-share.tweet-title',
        defaultMessage:
          "📊 I've been DCAing ${from} to ${to} {frequencyAdverb} on @balmy_xyz - Check out my investment stats!",
      }),
      {
        from: position.from.symbol,
        to: position.to.symbol,
        frequencyAdverb: intl.formatMessage(
          STRING_SWAP_INTERVALS[position.swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].adverb
        ),
      }
    ),
  };

  const startDate: TweetSubContent = {
    content: intl.formatMessage(
      defineMessage({
        description: 'dca.position-details.twitter-share.start-date',
        defaultMessage: '📅 Start Date: {startDate}',
      }),
      {
        startDate: DateTime.fromSeconds(position.startedAt).toLocaleString({ ...DateTime.DATE_FULL, year: undefined }),
      }
    ),
    prevLineBreaks: 2,
  };

  const frequency: TweetSubContent = {
    content: intl.formatMessage(
      defineMessage({
        description: 'dca.position-details.twitter-share.frequency',
        defaultMessage: '🕒 {frequencyPlural} Executed: {swapsAmount}',
      }),
      {
        frequencyPlural: capitalize(
          intl.formatMessage(
            STRING_SWAP_INTERVALS[position.swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].subject
          )
        ),
        swapsAmount: position.totalExecutedSwaps.toString(),
      }
    ),
    prevLineBreaks: 1,
    shouldNotInsert: position.totalExecutedSwaps === 0n,
  };

  const avgBuyPrice: TweetSubContent = {
    content: intl.formatMessage(
      defineMessage({
        description: 'dca.position-details.twitter-share.avg-buy-price',
        defaultMessage: '💰 Avg Buy Price: 1 {from} = {currencySymbol}{average} {to}',
      }),
      {
        from: tokenFromAverage.symbol,
        to: !STABLE_COINS.includes(tokenToAverage.symbol) ? tokenToAverage.symbol : '',
        average: formatCurrencyAmount({ amount: averageBuyPrice, token: tokenToAverage, sigFigs: 3, intl }),
        currencySymbol: STABLE_COINS.includes(tokenToAverage.symbol) ? '$' : '',
      }
    ),
    prevLineBreaks: 1,
    shouldNotInsert: averageBuyPrice === 0n,
  };

  const yieldFromContent: TweetSubContent = {
    content: intl.formatMessage(
      defineMessage({
        description: 'dca.position-details.twitter-share.yield-from',
        defaultMessage: '💵 {from} earning yield on {protocol}',
      }),
      {
        from: position.from.symbol,
        protocol: position.yields.from?.name,
      }
    ),
    prevLineBreaks: 1,
    shouldNotInsert: !position.yields.from,
  };

  const yieldToContent: TweetSubContent = {
    content: intl.formatMessage(
      defineMessage({
        description: 'dca.position-details.twitter-share.yield-to',
        defaultMessage: '🔄 {to} earning yield on {protocol}',
      }),
      {
        to: position.to.symbol,
        protocol: position.yields.to?.name,
      }
    ),
    prevLineBreaks: 1,
    shouldNotInsert: !position.yields.to,
  };

  const ctaContent: TweetSubContent = {
    content: intl.formatMessage(
      defineMessage({
        description: 'dca.position-details.twitter-share.cta',
        defaultMessage: 'Want to dig deeper? 👇🏼',
      })
    ),
    prevLineBreaks: 2,
  };

  const twitterShareText = [mainTitle, startDate, frequency, avgBuyPrice, yieldFromContent, yieldToContent, ctaContent]
    .map(({ content, prevLineBreaks, shouldNotInsert }) =>
      shouldNotInsert ? '' : '\n'.repeat(prevLineBreaks || 0) + content
    )
    .join('');

  return {
    twitterText: twitterShareText,
    twitterShareUrl: `https://app.balmy.xyz/${position.chainId}/positions/${position.version}/${position.positionId}?utm_source=twitter&utm_medium=social&utm_campaign=recurring_investment_shared`,
  };
};
