// import { Chains } from '@balmy/sdk';
import { FeeType, StrategyId } from 'common-types';
import { defineMessage } from 'react-intl';

export const FEE_TYPE_STRING_MAP: Record<FeeType, ReturnType<typeof defineMessage>> = {
  [FeeType.DEPOSIT]: defineMessage({
    description: 'earn.strategy.guardian.fee.type.depost',
    defaultMessage: 'Deposit',
  }),
  [FeeType.PERFORMANCE]: defineMessage({
    description: 'earn.strategy.guardian.fee.type.performance',
    defaultMessage: 'Performance',
  }),
  [FeeType.WITHDRAW]: defineMessage({
    description: 'earn.strategy.guardian.fee.type.withdraw',
    defaultMessage: 'Withdraw',
  }),
  [FeeType.RESCUE]: defineMessage({
    description: 'earn.strategy.guardian.fee.type.rescue',
    defaultMessage: 'Rescue',
  }),
};

export const PROMOTED_STRATEGIES_IDS: StrategyId[] = [
  // '137-0xb034a43d1ffe0f88ed3a50fc096179f543fd3f3a-1',
  // '8453-0x020ebf53f4e5ef859e18e2973bd8d8b9af5c9c9f-2',
  // '8453-0x020ebf53f4e5ef859e18e2973bd8d8b9af5c9c9f-3',
  // '8453-0x020ebf53f4e5ef859e18e2973bd8d8b9af5c9c9f-4',
];

export const STRATEGIES_WITH_LM_REWARDS: StrategyId[] = [
  // '8453-0xc0571929c21b71fc7579ec7159b1e88a2199bc78-15',
  // '8453-0xc0571929c21b71fc7579ec7159b1e88a2199bc78-16',
  // '8453-0xc0571929c21b71fc7579ec7159b1e88a2199bc78-17',
  // '8453-0xc0571929c21b71fc7579ec7159b1e88a2199bc78-18',
  // '8453-0xc0571929c21b71fc7579ec7159b1e88a2199bc78-20',
  // '8453-0xc0571929c21b71fc7579ec7159b1e88a2199bc78-21',
];
