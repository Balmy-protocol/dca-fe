import React from 'react';
import PositionTimelineControls, {
  TimelineMessageMap,
} from '@pages/position-detail/components/summary-container/components/swaps';
import {
  buildEarnCreatedItem,
  buildEarnIncreasedItem,
  buildEarnPermissionsModifiedItem,
  buildEarnTransferedItem,
  buildEarnWithdrawnItem,
} from '@pages/position-detail/components/summary-container/components/swaps/components/earn-items';
import { DisplayStrategy, EarnPosition, EarnPositionAction, EarnPositionActionType } from 'common-types';
import {
  StyledTimelineLink,
  TimelineItemSubTitle,
} from '@pages/position-detail/components/summary-container/components/swaps/components/common';
import { ContainerBox, OpenInNewIcon, Tooltip, Typography } from 'ui-library';
import {
  PositionTimelineProps,
  StyledTimelineTitleDate,
  StyledTimelineTitleEnd,
} from '@pages/position-detail/components/summary-container/components/swaps/components/timeline';
import { DateTime } from 'luxon';
import { defineMessage } from 'react-intl';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import { orderBy } from 'lodash';
import Address from '@common/components/address';
import { Address as ViemAddress } from 'viem';

interface StrategyTimelineProps {
  strategy: DisplayStrategy;
}

enum EarnFilterKeys {
  All,
  Deposits,
  Withdraws,
}

const MESSAGE_MAP: TimelineMessageMap<EarnPositionActionType, EarnPositionAction, EarnPosition> = {
  [EarnPositionActionType.CREATED]: buildEarnCreatedItem,
  [EarnPositionActionType.INCREASED]: buildEarnIncreasedItem,
  [EarnPositionActionType.WITHDREW]: buildEarnWithdrawnItem,
  [EarnPositionActionType.TRANSFERRED]: buildEarnTransferedItem,
  [EarnPositionActionType.PERMISSIONS_MODIFIED]: buildEarnPermissionsModifiedItem,
};

const FILTERS: Record<EarnFilterKeys, EarnPositionActionType[]> = {
  [EarnFilterKeys.All]: [
    EarnPositionActionType.CREATED,
    EarnPositionActionType.INCREASED,
    EarnPositionActionType.WITHDREW,
    EarnPositionActionType.TRANSFERRED,
    // EarnPositionActionType.PERMISSIONS_MODIFIED,
  ],
  [EarnFilterKeys.Deposits]: [EarnPositionActionType.CREATED, EarnPositionActionType.INCREASED],
  [EarnFilterKeys.Withdraws]: [EarnPositionActionType.WITHDREW],
};

const buildDcaTimelineHeader =
  (title: React.ReactElement, action: EarnPositionAction, chainId: number, owner: ViemAddress) => () => (
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
        <Typography variant="bodySmallLabel">
          <Address address={owner} />
        </Typography>
      </ContainerBox>
    </>
  );

const positionTimelineFilterOptions = [
  {
    title: defineMessage({ description: 'earn.timeline.filters.all', defaultMessage: 'All' }),
    key: EarnFilterKeys.All,
  },
  {
    title: defineMessage({ description: 'earn.timeline.filters.deposits', defaultMessage: 'Deposits' }),
    key: EarnFilterKeys.Deposits,
  },
  {
    title: defineMessage({ description: 'earn.timeline.filters.withdraws', defaultMessage: 'Withdraws' }),
    key: EarnFilterKeys.Withdraws,
  },
];

const StrategyTimeline = ({ strategy }: StrategyTimelineProps) => {
  const [tabIndex, setTabIndex] = React.useState<EarnFilterKeys>(EarnFilterKeys.All);

  const timelineItems = React.useMemo(() => {
    const items = strategy.userPositions?.reduce<PositionTimelineProps<EarnPositionAction, EarnPosition>['items']>(
      (acc, position) => {
        if (!('history' in position)) return acc;

        position.history?.forEach((positionState) => {
          if (FILTERS[tabIndex].includes(positionState.action)) {
            acc.push({
              position,
              positionState,
            });
          }
        });

        return acc;
      },
      []
    );

    return orderBy(items || [], ['positionState.tx.timestamp'], ['desc']);
  }, [strategy, tabIndex]);

  return (
    <PositionTimelineControls
      items={timelineItems}
      isLoading={false}
      renderContent={(historyItem) =>
        MESSAGE_MAP[historyItem.positionState.action](historyItem.positionState, historyItem.position).content
      }
      renderHeader={(historyItem) =>
        buildDcaTimelineHeader(
          MESSAGE_MAP[historyItem.positionState.action](historyItem.positionState, historyItem.position).title,
          historyItem.positionState,
          historyItem.position.strategy.farm.chainId,
          historyItem.position.owner
        )
      }
      renderIcon={(item) => MESSAGE_MAP[item.positionState.action](item.positionState, item.position).icon}
      getItemId={(item) => `${item.position.strategy.farm.chainId}-${item.positionState.tx.hash}`}
      tabIndex={tabIndex}
      setTabIndex={setTabIndex}
      options={positionTimelineFilterOptions}
    />
  );
};

export default StrategyTimeline;
