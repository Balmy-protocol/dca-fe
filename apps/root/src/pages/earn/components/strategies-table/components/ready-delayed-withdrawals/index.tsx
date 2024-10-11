import React from 'react';
import useDelayedWithdrawalPositions from '@hooks/earn/useDelayedWithdrawalPositions';
import { DelayedWithdrawalStatus, SdkEarnPositionId } from 'common-types';
import {
  Button,
  colors,
  KeyboardArrowDownIcon,
  OptionsMenuItems,
  OptionsMenuOption,
  OptionsMenuOptionType,
  TickCircleIcon,
  Typography,
} from 'ui-library';
import Address from '@common/components/address';
import { formatUsdAmount } from '@common/utils/currency';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { DelayWithdrawButtonIcon } from '../pending-delayed-withdrawals';
import useActiveWallet from '@hooks/useActiveWallet';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import { WalletActionType } from '@services/accountService';
import useTrackEvent from '@hooks/useTrackEvent';

const StyledReadyButton = styled(Button)`
  ${({ theme: { palette, spacing } }) => `
    border-color: ${colors[palette.mode].semantic.success.darker};
    background-color: ${colors[palette.mode].background.tertiary};
    color: ${colors[palette.mode].typography.typo1};
    padding: ${spacing(2)} ${spacing(4)};
    &:hover {
      border-color: ${colors[palette.mode].semantic.success.darker};
      background-color: ${colors[palette.mode].background.emphasis};
    }
  `}
`;

const StyledWithdrawButton = styled(Button)`
  &:hover {
    background-color: transparent;
  }
`;

const ReadyDelayedWithdrawals = () => {
  const readyDelayedWithdrawalPositions = useDelayedWithdrawalPositions({
    withdrawStatus: DelayedWithdrawalStatus.READY,
  });
  const activeWallet = useActiveWallet();
  const openConnectModal = useOpenConnectModal();
  const trackEvent = useTrackEvent();

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const intl = useIntl();

  const onReconnectWallet = () => {
    trackEvent('Earn - Ready delayed Withdrawal - Reconnect wallet');
    openConnectModal(WalletActionType.reconnect);
  };

  const handleWithdraw = (positionId: SdkEarnPositionId) => {
    // eslint-disable-next-line no-console
    console.log(positionId);
  };

  const readyOptions = React.useMemo(
    () =>
      readyDelayedWithdrawalPositions.map<OptionsMenuOption>((position) => {
        const isActiveWallet = activeWallet?.address === position.owner;

        const secondaryLabel = (
          <>
            {!isActiveWallet ? (
              <Typography variant="bodyExtraSmallBold" color="primary">
                <Address address={position.owner} />
              </Typography>
            ) : (
              <Address address={position.owner} />
            )}
            <>
              {' · $'}
              {formatUsdAmount({ amount: position.totalReadyUsd, intl })}
            </>
          </>
        );

        const onClick = isActiveWallet ? () => handleWithdraw(position.id) : onReconnectWallet;

        return {
          label: position.strategy.farm.name,
          secondaryLabel,
          type: OptionsMenuOptionType.option,
          Icon: TickCircleIcon,
          onClick,
          control: (
            <StyledWithdrawButton variant="text" size="small" onClick={onClick}>
              {isActiveWallet ? (
                <FormattedMessage defaultMessage="Withdraw" description="withdraw" />
              ) : (
                <FormattedMessage defaultMessage="Switch" description="switch" />
              )}
            </StyledWithdrawButton>
          ),
        };
      }),
    [readyDelayedWithdrawalPositions, activeWallet, intl, onReconnectWallet]
  );

  if (readyDelayedWithdrawalPositions.length === 0) {
    return null;
  }

  return (
    <>
      <StyledReadyButton
        variant="outlined"
        startIcon={<DelayWithdrawButtonIcon Icon={TickCircleIcon} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<KeyboardArrowDownIcon />}
      >
        {readyDelayedWithdrawalPositions.length === 1 ? (
          <FormattedMessage
            description="earn.strategies-table.ready-delayed-withdrawals.button-singular"
            defaultMessage="(1) Ready"
          />
        ) : (
          <FormattedMessage
            description="earn.strategies-table.ready-delayed-withdrawals.button-plural"
            defaultMessage="({amount}) Ready"
            values={{ amount: readyDelayedWithdrawalPositions.length }}
          />
        )}
      </StyledReadyButton>
      <OptionsMenuItems options={readyOptions} handleClose={() => setAnchorEl(null)} anchorEl={anchorEl} />
    </>
  );
};

export default ReadyDelayedWithdrawals;
