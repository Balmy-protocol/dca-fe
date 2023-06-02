import { defineMessage, MessageDescriptor } from 'react-intl';
import { Oracles, Permission, PositionActions, PositionStatus } from '@types';
import { NETWORKS } from './addresses';
import { FIFTEEN_MINUTES, FIVE_MINUTES, FOUR_HOURS, ONE_HOUR, ONE_MINUTE, THIRTY_MINUTES } from './swapIntervals';

export const MINIMUM_USD_RATE_FOR_DEPOSIT: Record<number, number> = {
  [NETWORKS.optimism.chainId]: 0.00001,
  [NETWORKS.arbitrum.chainId]: 0.00001,
  [NETWORKS.polygon.chainId]: 0.00001,
  [NETWORKS.mainnet.chainId]: 5,
};

export const DEFAULT_MINIMUM_USD_RATE_FOR_DEPOSIT = 5;

export enum ModeTypesIds {
  FULL_DEPOSIT_TYPE = 'full_deposit',
  RATE_TYPE = 'by_rate',
}

export const MODE_TYPES = {
  FULL_DEPOSIT: {
    label: 'Full deposit',
    id: ModeTypesIds.FULL_DEPOSIT_TYPE,
  },
  RATE: {
    label: 'By rate',
    id: ModeTypesIds.RATE_TYPE,
  },
};

export const MINIMUM_LIQUIDITY_USD = parseFloat('5000');

export const POSSIBLE_ACTIONS = {
  createPosition: 'createPosition',
  safeApproveAndCreatePosition: 'safeApproveAndCreatePosition',
  approveAndCreatePosition: 'approveAndCreatePosition',
  // approveTokenExact: 'approveTokenExact',
};

export const WHALE_MODE_FREQUENCIES = {
  [NETWORKS.polygon.chainId]: [
    ONE_MINUTE.toString(),
    FIVE_MINUTES.toString(),
    FIFTEEN_MINUTES.toString(),
    THIRTY_MINUTES.toString(),
    ONE_HOUR.toString(),
    FOUR_HOURS.toString(),
  ],
  [NETWORKS.mumbai.chainId]: [
    ONE_MINUTE.toString(),
    FIVE_MINUTES.toString(),
    FIFTEEN_MINUTES.toString(),
    THIRTY_MINUTES.toString(),
    ONE_HOUR.toString(),
    FOUR_HOURS.toString(),
  ],
  [NETWORKS.kovan.chainId]: [
    ONE_MINUTE.toString(),
    FIVE_MINUTES.toString(),
    FIFTEEN_MINUTES.toString(),
    THIRTY_MINUTES.toString(),
    ONE_HOUR.toString(),
    FOUR_HOURS.toString(),
  ],
  [NETWORKS.optimismKovan.chainId]: [
    ONE_MINUTE.toString(),
    FIVE_MINUTES.toString(),
    FIFTEEN_MINUTES.toString(),
    THIRTY_MINUTES.toString(),
    ONE_HOUR.toString(),
    FOUR_HOURS.toString(),
  ],
  [NETWORKS.optimism.chainId]: [
    ONE_MINUTE.toString(),
    FIVE_MINUTES.toString(),
    FIFTEEN_MINUTES.toString(),
    THIRTY_MINUTES.toString(),
    ONE_HOUR.toString(),
    FOUR_HOURS.toString(),
  ],
};

export const WHALE_MINIMUM_VALUES = {
  [NETWORKS.kovan.chainId]: {
    [ONE_MINUTE.toString()]: 10000,
    [FIVE_MINUTES.toString()]: 10000,
    [FIFTEEN_MINUTES.toString()]: 10000,
    [THIRTY_MINUTES.toString()]: 10000,
    [ONE_HOUR.toString()]: 10000,
    [FOUR_HOURS.toString()]: 10000,
  },
  [NETWORKS.polygon.chainId]: {
    [ONE_MINUTE.toString()]: 10000,
    [FIVE_MINUTES.toString()]: 10000,
    [FIFTEEN_MINUTES.toString()]: 10000,
    [THIRTY_MINUTES.toString()]: 10000,
    [ONE_HOUR.toString()]: 10000,
    [FOUR_HOURS.toString()]: 10000,
  },
  [NETWORKS.mumbai.chainId]: {
    [ONE_MINUTE.toString()]: 10000,
    [FIVE_MINUTES.toString()]: 10000,
    [FIFTEEN_MINUTES.toString()]: 10000,
    [THIRTY_MINUTES.toString()]: 10000,
    [ONE_HOUR.toString()]: 10000,
    [FOUR_HOURS.toString()]: 10000,
  },
  [NETWORKS.optimismKovan.chainId]: {
    [ONE_MINUTE.toString()]: 10000,
    [FIVE_MINUTES.toString()]: 10000,
    [FIFTEEN_MINUTES.toString()]: 10000,
    [THIRTY_MINUTES.toString()]: 10000,
    [ONE_HOUR.toString()]: 10000,
    [FOUR_HOURS.toString()]: 10000,
  },
  [NETWORKS.optimism.chainId]: {
    [ONE_MINUTE.toString()]: 10000,
    [FIVE_MINUTES.toString()]: 10000,
    [FIFTEEN_MINUTES.toString()]: 10000,
    [THIRTY_MINUTES.toString()]: 10000,
    [ONE_HOUR.toString()]: 10000,
    [FOUR_HOURS.toString()]: 10000,
  },
};

export const POSITION_ACTIONS: Record<string, PositionActions> = {
  MODIFIED_RATE: 'MODIFIED_RATE',
  MODIFIED_DURATION: 'MODIFIED_DURATION',
  MODIFIED_RATE_AND_DURATION: 'MODIFIED_RATE_AND_DURATION',
  WITHDREW: 'WITHDREW',
  SWAPPED: 'SWAPPED',
  CREATED: 'CREATED',
  TERMINATED: 'TERMINATED',
  TRANSFERED: 'TRANSFERED',
  PERMISSIONS_MODIFIED: 'PERMISSIONS_MODIFIED',
};

export const ORACLES: Record<'NONE' | 'CHAINLINK' | 'UNISWAP', Oracles> = {
  NONE: 0,
  CHAINLINK: 1,
  UNISWAP: 2,
};

export const ORACLE_STRINGS = {
  [ORACLES.NONE]: 'Not found',
  [ORACLES.CHAINLINK]: 'Chainlink',
  [ORACLES.UNISWAP]: 'Uniswap V3',
};

export enum PERMISSIONS {
  INCREASE = 0,
  REDUCE = 1,
  WITHDRAW = 2,
  TERMINATE = 3,
}

export const STRING_PERMISSIONS: Record<Permission, MessageDescriptor> = {
  INCREASE: defineMessage({ defaultMessage: 'Increase position', description: 'permissionsIncreasePermission' }),
  REDUCE: defineMessage({ defaultMessage: 'Reduce position', description: 'permissionsReducePermission' }),
  WITHDRAW: defineMessage({ defaultMessage: 'Withdraw', description: 'permissionsWithdrawPermission' }),
  TERMINATE: defineMessage({ defaultMessage: 'Close position', description: 'permissionsClosePermission' }),
};

const POSITION_STATUS_ACTIVE: PositionStatus = 'ACTIVE';
const POSITION_STATUS_COMPLETED: PositionStatus = 'COMPLETED';
const POSITION_STATUS_TERMINATED: PositionStatus = 'TERMINATED';

export const POSITION_STATUSES: Record<PositionStatus, PositionStatus> = {
  [POSITION_STATUS_ACTIVE]: POSITION_STATUS_ACTIVE,
  [POSITION_STATUS_COMPLETED]: POSITION_STATUS_COMPLETED,
  [POSITION_STATUS_TERMINATED]: POSITION_STATUS_TERMINATED,
};
