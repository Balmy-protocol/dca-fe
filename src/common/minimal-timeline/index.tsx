import React from 'react';
import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CircularProgress from '@mui/material/CircularProgress';

const StyledTimeline = styled(Grid)`
  position: relative;
  padding: 0px 0px 0px 10px;
  &:before {
    content: '';
    position: absolute;
    left: 10px;
    top: 5px;
    width: 4px;
    height: 100%;
    border-left: 3px dashed #dce2f9;
  }
`;

const StyledTimelineContainer = styled(Grid)`
  position: relative;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
`;

const StyledTimelineIcon = styled.div`
  position: absolute;
  left: -7px;
  top: calc(50% - 8px);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  text-align: center;
  background: #dce2f9;

  i {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  svg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
`;

const StyledTimelineContent = styled.div`
  padding: 0px;
  position: relative;
  text-align: start;
  color: rgba(255, 255, 255, 0.5) !important;
  padding: 0px 10px 0px 22px;
  overflow-wrap: anywhere;
  font-weight: 400 !important;
  flex-grow: 1;
`;

const StyledTimelineLink = styled.div``;

interface TimelineItemProps {
  content: React.ReactNode;
  link: string;
  isPending: boolean;
}

interface TimelineProps {
  items: TimelineItemProps[];
}

const MinimalTimeline = ({ items }: TimelineProps) => (
  <StyledTimeline container>
    {items.map((item) => (
      <StyledTimelineContainer item xs={12}>
        <StyledTimelineIcon />
        <StyledTimelineContent>
          <Typography variant="body1">{item.content}</Typography>
        </StyledTimelineContent>
        <StyledTimelineLink>
          {item.isPending && <CircularProgress size={24} />}
          {!item.isPending && (
            <IconButton aria-label="close" onClick={() => window.open(item.link, '_blank')}>
              <OpenInNewIcon style={{ color: '#3076F6', fontSize: '1.5rem' }} />
            </IconButton>
          )}
        </StyledTimelineLink>
      </StyledTimelineContainer>
    ))}
  </StyledTimeline>
);
export default MinimalTimeline;
