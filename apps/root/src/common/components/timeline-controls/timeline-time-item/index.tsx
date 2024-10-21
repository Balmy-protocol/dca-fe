import { DateTime } from 'luxon';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Tooltip } from 'ui-library';
import { StyledTimelineTitleDate } from '../timeline';

const TimelineTimeItem = ({ timestamp }: { timestamp: number }) => {
  const isAtLeast10MinutesAgo = DateTime.now().diff(DateTime.fromSeconds(timestamp), 'minutes').minutes < 10;

  if (isAtLeast10MinutesAgo) {
    return (
      <Tooltip title={DateTime.fromSeconds(timestamp).toLocaleString(DateTime.DATETIME_MED)}>
        <StyledTimelineTitleDate>
          <FormattedMessage description="earn.timeline.transaction-data.time.just-now" defaultMessage="Just now" />
        </StyledTimelineTitleDate>
      </Tooltip>
    );
  }
  const isAtLeast1MonthAgo = DateTime.now().diff(DateTime.fromSeconds(timestamp), 'months').months < 1;

  if (isAtLeast1MonthAgo) {
    return (
      <Tooltip title={DateTime.fromSeconds(timestamp).toLocaleString(DateTime.DATETIME_MED)}>
        <StyledTimelineTitleDate>{DateTime.fromSeconds(timestamp).toRelative()}</StyledTimelineTitleDate>
      </Tooltip>
    );
  }

  return (
    <StyledTimelineTitleDate>
      {DateTime.fromSeconds(timestamp).toLocaleString(DateTime.DATETIME_MED)}
    </StyledTimelineTitleDate>
  );
};

export default TimelineTimeItem;
