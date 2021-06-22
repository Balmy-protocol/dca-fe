import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
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
import BlockIcon from '@material-ui/icons/Block';
import CallSplitIcon from '@material-ui/icons/CallSplit';
import SettingsIcon from '@material-ui/icons/Settings';
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

const useDeletedStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.palette.error.main,
    },
  })
);

interface ActivePositionProps {
  from: string;
  to: string;
  remainingDays: number;
  startedAt: Date;
  exercised: number;
  remainingLiquidity: number;
}

const ActivePosition = ({ from, to, remainingDays, startedAt, exercised, remainingLiquidity }: ActivePositionProps) => {
  const buttonContent = <MoreVertIcon />;
  const classNames = useDeletedStyles();

  return (
    <StyledCard>
      <CardContent>
        <StyledCardHeader>
          <StyledCardTitleHeader>
            <Typography variant="h6">{from}</Typography>
            <ArrowForwardIcon />
            <Typography variant="h6">{to}</Typography>
          </StyledCardTitleHeader>
          <FloatingMenu buttonContent={buttonContent} buttonStyles={{}} isIcon>
            <MenuItem onClick={() => alert('are you fucking sure?')}>
              <StyledListItemIcon>
                <CallSplitIcon fontSize="small" />
              </StyledListItemIcon>
              <ListItemText>
                <FormattedMessage description="Withdraw" defaultMessage="Withdraw" />
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={() => alert('are you fucking sure?')}>
              <StyledListItemIcon>
                <SettingsIcon fontSize="small" />
              </StyledListItemIcon>
              <ListItemText>
                <FormattedMessage description="Modify frequency" defaultMessage="Modify Frequency" />
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={() => alert('are you fucking sure?')} classes={classNames}>
              <StyledListItemIcon>
                <BlockIcon fontSize="small" />
              </StyledListItemIcon>
              <ListItemText>
                <FormattedMessage description="Drop out" defaultMessage="Drop out" />
              </ListItemText>
            </MenuItem>
          </FloatingMenu>
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
            defaultMessage="{remainingLiquidity} {from} remaining"
            values={{ remainingLiquidity, from }}
          />
        </Typography>
        <Typography variant="caption">
          <FormattedMessage
            description="days to finish"
            defaultMessage="Started at: {startedAt} with {remainingDays} days to close"
            values={{ startedAt: DateTime.fromJSDate(startedAt).toLocaleString(), remainingDays }}
          />
        </Typography>
      </CardContent>
    </StyledCard>
  );
};
export default ActivePosition;
