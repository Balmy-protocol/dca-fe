import React from 'react';
import usePositionsWithSingleDelayedWithdrawal from '@hooks/earn/usePositionsWithSingleDelayedWithdrawal';
import { DelayedWithdrawalStatus } from 'common-types';
import {
  Button,
  ChevronRightIcon,
  colors,
  KeyboardArrowDownIcon,
  OptionsMenuItems,
  OptionsMenuOption,
  OptionsMenuOptionType,
  SPACING,
  TimerIcon,
} from 'ui-library';
import Address from '@common/components/address';
import { formatUsdAmount } from '@common/utils/currency';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import usePushToHistory from '@hooks/usePushToHistory';
import useTrackEvent from '@hooks/useTrackEvent';

const StyledPendingButton = styled(Button)`
  ${({ theme: { palette } }) => `
    border-color: ${colors[palette.mode].semantic.warning.darker};
    background-color: ${colors[palette.mode].background.emphasis};
    color: ${colors[palette.mode].typography.typo1};
    &:hover {
      border-color: ${colors[palette.mode].semantic.warning.darker};
      background-color: ${colors[palette.mode].background.emphasis};
    }
  `}
`;

const PendingDelayedWithdrawals = () => {
  const pendingDelayedWithdrawalPositions = usePositionsWithSingleDelayedWithdrawal({
    status: DelayedWithdrawalStatus.PENDING,
  });
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const intl = useIntl();
  const pushToHistory = usePushToHistory();
  const trackEvent = useTrackEvent();

  const pendingOptions = React.useMemo(
    () =>
      pendingDelayedWithdrawalPositions.map<OptionsMenuOption>((position) => ({
        label: position.strategy.farm.name,
        secondaryLabel: (
          <>
            <Address address={position.owner} />
            {position.delayed.pending.amountInUSD && (
              <>
                {' · $'}
                {formatUsdAmount({ amount: position.delayed.pending.amountInUSD, intl })}
              </>
            )}
          </>
        ),
        type: OptionsMenuOptionType.option,
        Icon: TimerIcon,
        onClick: () => {
          pushToHistory(`/earn/vaults/${position.strategy.network.chainId}/${position.strategy.id}`);
          trackEvent('Earn - Go to strategy page from pending delayed withdrawal');
        },
        control: <ChevronRightIcon />,
      })),
    [pendingDelayedWithdrawalPositions, intl]
  );

  if (pendingDelayedWithdrawalPositions.length === 0) {
    return null;
  }

  return (
    <>
      <StyledPendingButton
        variant="outlined"
        startIcon={
          <TimerIcon size={SPACING(3.75)} sx={({ palette }) => ({ color: colors[palette.mode].typography.typo3 })} />
        }
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<KeyboardArrowDownIcon />}
      >
        {pendingDelayedWithdrawalPositions.length === 1 ? (
          <FormattedMessage
            description="earn.strategies-table.pending-delayed-withdrawals.button-singular"
            defaultMessage="(1) Pending Withdrawal"
          />
        ) : (
          <FormattedMessage
            description="earn.strategies-table.pending-delayed-withdrawals.button-plural"
            defaultMessage="({amount}) Pending Withdrawals"
            values={{ amount: pendingDelayedWithdrawalPositions.length }}
          />
        )}
      </StyledPendingButton>
      <OptionsMenuItems options={pendingOptions} handleClose={() => setAnchorEl(null)} anchorEl={anchorEl} />
    </>
  );
};

export default PendingDelayedWithdrawals;
