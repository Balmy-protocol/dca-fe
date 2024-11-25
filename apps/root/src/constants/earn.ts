// import { Chains } from '@balmy/sdk';
import { FeeType } from 'common-types';
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

export const BALMY_FEES = [{ percentage: 0.2, type: FeeType.PERFORMANCE }];

// export const EARN_AVAILABLE_CHAINS = [
//   Chains.POLYGON.chainId,
//   Chains.ETHEREUM.chainId,
//   Chains.OPTIMISM.chainId,
//   Chains.ARBITRUM.chainId,
//   Chains.BASE.chainId,
// ];
