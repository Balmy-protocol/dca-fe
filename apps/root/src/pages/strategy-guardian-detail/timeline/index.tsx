import React from 'react';
import PositionTimelineControls, { TimelineMessageMap } from '@common/components/timeline-controls';
import {
  buildEarnCreatedItem,
  buildEarnIncreasedItem,
  buildEarnPermissionsModifiedItem,
  buildEarnTransferedItem,
  buildEarnWithdrawnItem,
} from '@common/components/timeline-controls/earn-items';
import { DisplayStrategy, EarnPosition, EarnPositionAction, EarnPositionActionType } from 'common-types';
import { PositionTimelineProps } from '@common/components/timeline-controls/timeline';
import { defineMessage } from 'react-intl';
import { orderBy } from 'lodash';

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
      renderComponent={(historyItem) =>
        MESSAGE_MAP[historyItem.positionState.action](historyItem.positionState, historyItem.position)
      }
      getItemId={(item) => `${item.position.strategy.farm.chainId}-${item.positionState.tx.hash}`}
      tabIndex={tabIndex}
      setTabIndex={setTabIndex}
      options={positionTimelineFilterOptions}
    />
  );
};

export default StrategyTimeline;
