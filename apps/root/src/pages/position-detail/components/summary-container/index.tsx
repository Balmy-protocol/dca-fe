import React from 'react';
import styled from 'styled-components';
import { BackgroundPaper, ContainerBox, Grid, OpenInNewIcon, Tooltip, Typography } from 'ui-library';
import { Position, PositionWithHistory } from '@types';
import Sticky from 'react-stickynode';

import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';
import GraphContainer from '@pages/position-detail/components/graph-container';
import PositionTimelineControls, { TimelineMessageMap } from '@common/components/timeline-controls';
import Details from './components/position-data';
import PositionDataSkeleton from './components/position-data/position-data-skeleton';
import { defineMessage } from 'react-intl';
import { ActionTypeAction, DCAPositionAction } from '@balmy/sdk';
import {
  buildDcaCreatedItem,
  buildDcaModifiedPermissionsItem,
  buildDcaModifiedRateAndDurationItem,
  buildDcaSwappedItem,
  buildDcaTerminatedItem,
  buildDcaTransferedItem,
  buildDcaWithdrawnItem,
} from '@common/components/timeline-controls/dca-items';
import {
  PositionTimelineProps,
  StyledTimelineTitleDate,
  StyledTimelineTitleEnd,
} from '@common/components/timeline-controls/timeline';
import { StyledTimelineLink, TimelineItemSubTitle } from '@common/components/timeline-controls/common';
import { DateTime } from 'luxon';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import { orderBy } from 'lodash';

const StyledPaper = styled(BackgroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(6)}
  `}
`;

const StyledFlexGridItem = styled(Grid)`
  display: flex;

  .sticky-outer-wrapper {
    flex: 1;
  }
`;

interface PositionSummaryContainerProps {
  position?: PositionWithHistory;
  pendingTransaction: string | null;
  isLoading: boolean;
}

export enum DcaFilterKeys {
  All,
  Swaps,
  Modifications,
  Withdraws,
}

const buildDcaTimelineHeader = (title: React.ReactElement, action: DCAPositionAction, chainId: number) => () => (
  <>
    <TimelineItemSubTitle>{title}</TimelineItemSubTitle>
    <ContainerBox flexDirection="column" gap={1}>
      <StyledTimelineTitleEnd>
        <Tooltip title={DateTime.fromSeconds(action.tx.timestamp).toLocaleString(DateTime.DATETIME_MED)}>
          <StyledTimelineTitleDate>{DateTime.fromSeconds(action.tx.timestamp).toRelative()}</StyledTimelineTitleDate>
        </Tooltip>
        <Typography variant="bodyRegular">
          <StyledTimelineLink
            href={buildEtherscanTransaction(action.tx.hash, chainId)}
            target="_blank"
            rel="noreferrer"
          >
            <OpenInNewIcon fontSize="inherit" />
          </StyledTimelineLink>
        </Typography>
      </StyledTimelineTitleEnd>
    </ContainerBox>
  </>
);

const MESSAGE_MAP: TimelineMessageMap<ActionTypeAction, DCAPositionAction, Position> = {
  [ActionTypeAction.CREATED]: buildDcaCreatedItem,
  [ActionTypeAction.MODIFIED]: buildDcaModifiedRateAndDurationItem,
  [ActionTypeAction.SWAPPED]: buildDcaSwappedItem,
  [ActionTypeAction.WITHDRAWN]: buildDcaWithdrawnItem,
  [ActionTypeAction.TERMINATED]: buildDcaTerminatedItem,
  [ActionTypeAction.TRANSFERRED]: buildDcaTransferedItem,
  [ActionTypeAction.MODIFIED_PERMISSIONS]: buildDcaModifiedPermissionsItem,
};

const FILTERS: Record<DcaFilterKeys, ActionTypeAction[]> = {
  [DcaFilterKeys.All]: [
    ActionTypeAction.CREATED,
    ActionTypeAction.MODIFIED,
    // ActionTypeAction.MODIFIED_PERMISSIONS,
    ActionTypeAction.SWAPPED,
    ActionTypeAction.TERMINATED,
    ActionTypeAction.TRANSFERRED,
    ActionTypeAction.WITHDRAWN,
  ],
  [DcaFilterKeys.Swaps]: [ActionTypeAction.SWAPPED],
  [DcaFilterKeys.Modifications]: [
    ActionTypeAction.CREATED,
    ActionTypeAction.MODIFIED,
    ActionTypeAction.TRANSFERRED,
    ActionTypeAction.TERMINATED,
    // ActionTypeAction.MODIFIED_PERMISSIONS,
  ],
  [DcaFilterKeys.Withdraws]: [ActionTypeAction.WITHDRAWN],
};

const positionTimelineFilterOptions = [
  { title: defineMessage({ description: 'all', defaultMessage: 'All' }), key: DcaFilterKeys.All },
  { title: defineMessage({ description: 'swaps', defaultMessage: 'Swaps' }), key: DcaFilterKeys.Swaps },
  {
    title: defineMessage({ description: 'modifications', defaultMessage: 'Modifications' }),
    key: DcaFilterKeys.Modifications,
  },
  { title: defineMessage({ description: 'withdraws', defaultMessage: 'Withdraws' }), key: DcaFilterKeys.Withdraws },
];

const PositionSummaryContainer = ({ position, pendingTransaction, isLoading }: PositionSummaryContainerProps) => {
  const [tabIndex, setTabIndex] = React.useState<DcaFilterKeys>(DcaFilterKeys.All);
  const currentBreakpoint = useCurrentBreakpoint();

  const isDownMd = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';

  const timelineItems = React.useMemo(() => {
    const items = position?.history
      .filter((positionState) => FILTERS[tabIndex].includes(positionState.action))
      .map<PositionTimelineProps<DCAPositionAction, PositionWithHistory>['items'][0]>((positionState) => ({
        position,
        positionState,
      }));
    return orderBy(items, ['positionState.tx.timestamp'], ['desc']);
  }, [position, tabIndex]);

  return (
    <Grid container spacing={6} alignItems="flex-start">
      <StyledFlexGridItem item xs={12} md={5}>
        <Sticky enabled={!isDownMd} top={95}>
          <StyledPaper>
            {isLoading ? (
              <PositionDataSkeleton />
            ) : (
              position && <Details position={position} pendingTransaction={pendingTransaction} />
            )}
          </StyledPaper>
        </Sticky>
      </StyledFlexGridItem>
      <Grid item xs={12} md={7}>
        <Grid container direction="column" spacing={6} flexWrap="nowrap">
          <Grid item xs={12}>
            <GraphContainer position={position} isLoading={isLoading} />
          </Grid>
          <Grid item xs={12}>
            <PositionTimelineControls
              items={timelineItems}
              renderContent={(item) =>
                MESSAGE_MAP[item.positionState.action](item.positionState, item.position).content
              }
              renderHeader={(item) =>
                buildDcaTimelineHeader(
                  MESSAGE_MAP[item.positionState.action](item.positionState, item.position).title,
                  item.positionState,
                  item.position.chainId
                )
              }
              renderIcon={(item) => MESSAGE_MAP[item.positionState.action](item.positionState, item.position).icon}
              getItemId={(item) => `${item.position.chainId}-${item.positionState.tx.hash}`}
              isLoading={isLoading}
              options={positionTimelineFilterOptions}
              setTabIndex={setTabIndex}
              tabIndex={tabIndex}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default PositionSummaryContainer;
