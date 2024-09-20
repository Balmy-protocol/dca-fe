import { defineMessage } from 'react-intl';
import styled from 'styled-components';
import { Link, Typography, colors, ArrowRightIcon } from 'ui-library';

export const StyledTimelineLink = styled(Link)<{ $isFirst?: boolean }>`
  margin: ${({ $isFirst }) => ($isFirst ? '0px 5px 0px 0px' : '0px 5px')};
  display: flex;
`;

export const TimelineItemAmount = styled(Typography).attrs(() => ({ variant: 'bodyBold' }))``;
export const TimelineItemAmountText = styled(Typography).attrs(() => ({ variant: 'bodyRegular' }))``;
export const TimelineItemAmountTextUsd = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
  }) => ({ variant: 'bodyRegular', color: colors[mode].typography.typo3 })
)``;
export const TimelineItemAmountUsd = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
  }) => ({ variant: 'bodyRegular', color: colors[mode].typography.typo3 })
)``;
export const TimelineItemTitle = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
  }) => ({ variant: 'labelRegular', color: colors[mode].typography.typo2 })
)``;
export const TimelineItemSubTitle = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
  }) => ({ variant: 'bodySmallBold', color: colors[mode].typography.typo2 })
)``;

export const StyledTimelineCurrentValueBold = styled(Typography).attrs({ variant: 'bodyBold' })`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo5}
    `}
`;
export const StyledTimelineCurrentValueRegular = styled(Typography).attrs({ variant: 'bodyRegular' })`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo5}
    `}
`;

export const StyledTimelineArrowIcon = styled(ArrowRightIcon)`
  transform: rotate(90deg);
  font-size: ${({ theme }) => theme.spacing(4)};
`;

export const timelineCurrentPriceMessage = defineMessage({
  defaultMessage: 'Displaying current value. Click to show value on day of the event',
  description: 'timeline.display-current-price',
});
export const timelinePrevPriceMessage = defineMessage({
  defaultMessage: 'Estimated value on day of the event',
  description: 'timeline.display-previous-price',
});
