import React from 'react';
import { Grid, Typography, ContainerBox, Skeleton, colors } from 'ui-library';
import { TimelineItemAmount, TimelineItemTitle } from '../common';

import styled, { useTheme } from 'styled-components';
import { TimelineItemComponent } from '..';

const StyledTimeline = styled(ContainerBox)`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
    position: relative;
    padding: 0px 0px 0px ${spacing(6)};
    &:before {
      content: '';
      position: absolute;
      left: ${spacing(6)};
      top: 5px;
      width: 4px;
      bottom: ${spacing(15)};
      border-left: 3px dashed ${colors[mode].border.border1};
    }
  `}
`;

const StyledTimelineContainer = styled(ContainerBox)`
  ${({ theme: { spacing } }) => `
  position: relative;
  margin-bottom: ${spacing(8)};
  `}
`;

export const StyledTimelineTitleEnd = styled(ContainerBox).attrs({
  gap: 2,
  alignItems: 'center',
  justifyContent: 'flex-end',
})``;

export const StyledTimelineIcon = styled.div`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
    position: absolute;
    color: ${colors[mode].typography.typo3};
    left: -${spacing(7.5)};
    top: 0px;
    width: ${spacing(15)};
    height: ${spacing(15)};
    border-radius: 50%;
    text-align: center;
    border: 1px solid ${colors[mode].border.border1};
    background: ${colors[mode].background.secondary};

    i, .MuiSkeleton-root {
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
      width: ${spacing(6)};
      height: ${spacing(6)};
      color: inherit;
    }

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  `}
`;

export const StyledTimelineContent = styled.div`
  ${({ theme: { spacing } }) => `
    padding: 0px 0px 0px ${spacing(13)};
  `}
  position: relative;
  text-align: start;
  overflow-wrap: anywhere;
  flex-grow: 1;
`;

export const StyledTimelineContentTitle = styled(Grid)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const StyledTimelineTitleDate = styled(Typography).attrs(() => ({ variant: 'labelRegular' }))``;

const skeletonRows = Array.from(Array(8).keys());

const TimelineSkeleton = () => {
  const { spacing } = useTheme();
  return (
    <StyledTimeline flexDirection="column">
      {skeletonRows.map((key) => (
        <StyledTimelineContainer key={key}>
          <StyledTimelineIcon>
            <Skeleton variant="circular" width={spacing(6)} height={spacing(6)} />
          </StyledTimelineIcon>
          <StyledTimelineContent>
            <Grid container>
              <StyledTimelineContentTitle item xs={12}>
                <TimelineItemAmount>
                  <Skeleton variant="text" width="10ch" />
                </TimelineItemAmount>
                <StyledTimelineTitleEnd>
                  <StyledTimelineTitleDate>
                    <Skeleton variant="text" width="5ch" />
                  </StyledTimelineTitleDate>
                </StyledTimelineTitleEnd>
              </StyledTimelineContentTitle>
              <Grid item xs={12}>
                <ContainerBox gap={6}>
                  <ContainerBox flexDirection="column">
                    <TimelineItemTitle>
                      <Skeleton variant="text" width="10ch" />
                    </TimelineItemTitle>
                    <ContainerBox alignItems="center" gap={2}>
                      <Skeleton variant="circular" width={spacing(5)} />
                      <ContainerBox gap={1}>
                        <TimelineItemAmount>
                          <Skeleton variant="text" width="5ch" />
                        </TimelineItemAmount>
                      </ContainerBox>
                    </ContainerBox>
                  </ContainerBox>
                  <ContainerBox flexDirection="column">
                    <TimelineItemTitle>
                      <Skeleton variant="text" width="10ch" />
                    </TimelineItemTitle>
                    <ContainerBox>
                      <TimelineItemAmount>
                        <Skeleton variant="text" width="5ch" />
                      </TimelineItemAmount>
                    </ContainerBox>
                  </ContainerBox>
                </ContainerBox>
              </Grid>
            </Grid>
          </StyledTimelineContent>
        </StyledTimelineContainer>
      ))}
    </StyledTimeline>
  );
};

export type TimelineHistoryItem<TAction, TPosition> = {
  position: TPosition;
  positionState: TAction;
};

export interface PositionTimelineProps<TAction, TPosition> {
  items: TimelineHistoryItem<TAction, TPosition>[];
  renderComponent: (item: TimelineHistoryItem<TAction, TPosition>) => TimelineItemComponent;
  getItemId: (item: TimelineHistoryItem<TAction, TPosition>) => string;
  isLoading: boolean;
}

const PositionTimeline = <TAction, TPosition>({
  items,
  isLoading,
  getItemId,
  renderComponent,
}: PositionTimelineProps<TAction, TPosition>) => {
  if (isLoading) {
    return <TimelineSkeleton />;
  }

  return (
    <StyledTimeline flexDirection="column">
      {items.map((historyItem) => {
        const Component = renderComponent(historyItem);
        return (
          <StyledTimelineContainer key={getItemId(historyItem)}>
            <StyledTimelineIcon>
              <Component.icon />
            </StyledTimelineIcon>
            <StyledTimelineContent>
              <ContainerBox justifyContent="space-between">
                <ContainerBox flexDirection="column">
                  <Component.content />
                </ContainerBox>
                <Component.transactionData />
              </ContainerBox>
            </StyledTimelineContent>
          </StyledTimelineContainer>
        );
      })}
    </StyledTimeline>
  );
};
export default PositionTimeline;
