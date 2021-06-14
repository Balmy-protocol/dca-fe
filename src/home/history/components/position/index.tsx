import * as React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { FormattedMessage } from 'react-intl';
import { DateTime } from 'luxon';
import FloatingMenu from 'common/floating-menu';

const StyledCard = styled(Card)`
  margin: 10px;
  width: 250px;
`;

const StyledCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledCardTitleHeader = styled.div`
  display: flex;
  align-items: center;
`;

const StyledListItemIcon = styled(ListItemIcon)`
  min-width: 28px;
`;

interface PastPositionProps {
  from: string;
  to: string;
  initialAmmount: number;
  exercised: number;
  startedAt: Date;
  daysSet: number;
}

const PastPosition = ({ from, to, daysSet, startedAt, exercised, initialAmmount }: PastPositionProps) => {
  return (
    <StyledCard>
      <CardContent>
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
        <Typography variant="body2">
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
      </CardContent>
    </StyledCard>
  );
};

export default PastPosition;
