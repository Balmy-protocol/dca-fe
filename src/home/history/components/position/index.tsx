import * as React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { DateTime } from 'luxon';

const StyledCard = styled(Card)`
  margin: 10px;
`;

const StyledCardContent = styled(CardContent)`
  padding-bottom: 0px;
`;

const StyledCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledCardTitleHeader = styled.div`
  display: flex;
  align-items: center;
`;

interface PastPositionProps {
  from: string;
  to: string;
  initialAmmount: number;
  exercised: number;
  startedAt: Date;
  daysSet: number;
}

const PastPosition = ({ from, to, daysSet, startedAt, exercised, initialAmmount }: PastPositionProps) => (
  <StyledCard>
    <StyledCardContent>
      <StyledCardHeader>
        <StyledCardTitleHeader>
          <Typography variant="h6">{from}</Typography>
          <ArrowForwardIcon />
          <Typography variant="h6">{to}</Typography>
        </StyledCardTitleHeader>
      </StyledCardHeader>
      <Typography variant="subtitle1">
        <FormattedMessage
          description="current exercised"
          defaultMessage="{exercised} {to} swapped"
          values={{ exercised, to }}
        />
      </Typography>
      <Typography variant="subtitle2">
        <FormattedMessage
          description="current remaining"
          defaultMessage="From {initialAmmount} {from}"
          values={{ initialAmmount, from }}
        />
      </Typography>
      <Typography variant="caption">
        <FormattedMessage
          description="days to finish"
          defaultMessage="Started at: {startedAt} for {daysSet} days"
          values={{ startedAt: DateTime.fromJSDate(startedAt).toLocaleString(), daysSet }}
        />
      </Typography>
    </StyledCardContent>
  </StyledCard>
);

export default PastPosition;
