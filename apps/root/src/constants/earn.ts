import { FeeType } from 'common-types';
import { defineMessage } from 'react-intl';

export const FEE_TYPE_STRING_MAP: Record<FeeType, ReturnType<typeof defineMessage>> = {
  [FeeType.deposit]: defineMessage({
    description: 'earn.strategy.guardian.fee.type.depost',
    defaultMessage: 'Deposit',
  }),
  [FeeType.performance]: defineMessage({
    description: 'earn.strategy.guardian.fee.type.performance',
    defaultMessage: 'Performance',
  }),
  [FeeType.withdraw]: defineMessage({
    description: 'earn.strategy.guardian.fee.type.withdraw',
    defaultMessage: 'Withdraw',
  }),
  [FeeType.save]: defineMessage({
    description: 'earn.strategy.guardian.fee.type.save',
    defaultMessage: 'Save',
  }),
};
