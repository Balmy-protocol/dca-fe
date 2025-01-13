import React from 'react';
import PositionTimelineControls, { TimelineMessageMap } from '@common/components/timeline-controls';
import {
  buildEarnCreatedItem,
  buildEarnIncreasedItem,
  buildEarnPermissionsModifiedItem,
  buildEarnTransferedItem,
  buildEarnWithdrawnItem,
  buildEarnDelayedWithdrawalClaimedItem,
  buildEarnSpecialWithdrawnItem,
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
  [EarnPositionActionType.SPECIAL_WITHDREW]: buildEarnSpecialWithdrawnItem,
  [EarnPositionActionType.DELAYED_WITHDRAWAL_CLAIMED]: buildEarnDelayedWithdrawalClaimedItem,
  [EarnPositionActionType.TRANSFERRED]: buildEarnTransferedItem,
  [EarnPositionActionType.PERMISSIONS_MODIFIED]: buildEarnPermissionsModifiedItem,
};

const FILTERS: Record<EarnFilterKeys, EarnPositionActionType[]> = {
  [EarnFilterKeys.All]: [
    EarnPositionActionType.CREATED,
    EarnPositionActionType.INCREASED,
    EarnPositionActionType.WITHDREW,
    EarnPositionActionType.SPECIAL_WITHDREW,
    EarnPositionActionType.DELAYED_WITHDRAWAL_CLAIMED,
    EarnPositionActionType.TRANSFERRED,
    // EarnPositionActionType.PERMISSIONS_MODIFIED,
  ],
  [EarnFilterKeys.Deposits]: [EarnPositionActionType.CREATED, EarnPositionActionType.INCREASED],
  [EarnFilterKeys.Withdraws]: [
    EarnPositionActionType.WITHDREW,
    EarnPositionActionType.SPECIAL_WITHDREW,
    EarnPositionActionType.DELAYED_WITHDRAWAL_CLAIMED,
  ],
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
    title: defineMessage({ description: 'earn.timeline.filters.withdraws', defaultMessage: 'Withdrawals' }),
    key: EarnFilterKeys.Withdraws,
  },
];

const StrategyTimeline = ({ strategy }: StrategyTimelineProps) => {
  const [tabIndex, setTabIndex] = React.useState<EarnFilterKeys>(EarnFilterKeys.All);

  const timelineItems = React.useMemo(() => {
    const items = strategy.userPositions?.reduce<PositionTimelineProps<EarnPositionAction, EarnPosition>['items']>(
      (acc, position) => {
        if (!('history' in position)) return acc;

        position.history
          ?.filter((positionState) => {
            // filter withdraw 0 positions
            if (positionState.action === EarnPositionActionType.WITHDREW) {
              return positionState.withdrawn.length > 0;
            }
            return true;
          })
          .forEach((positionState) => {
            if (FILTERS[tabIndex].includes(positionState.action as EarnPositionActionType)) {
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
      getItemId={(item) =>
        `${item.position.strategy.network.chainId}-${item.positionState.tx.hash}-${item.positionState.action}`
      }
      tabIndex={tabIndex}
      setTabIndex={setTabIndex}
      options={positionTimelineFilterOptions}
    />
  );
};

export default StrategyTimeline;
