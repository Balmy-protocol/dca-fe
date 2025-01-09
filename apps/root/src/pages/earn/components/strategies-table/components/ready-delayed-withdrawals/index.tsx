import React from 'react';
import { DelayedWithdrawalStatus, WalletStatus } from 'common-types';
import {
  Button,
  colors,
  HiddenNumber,
  KeyboardArrowDownIcon,
  Link,
  OpenInNewIcon,
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
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import { WalletActionType } from '@services/accountService';
import useAnalytics from '@hooks/useAnalytics';
import useEarnClaimDelayedWithdrawAction from '@hooks/earn/useEarnClaimDelayedWithdrawAction';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import useEarnPositions from '@hooks/earn/useEarnPositions';
import { getDelayedWithdrawals } from '@common/utils/earn/parsing';
import { useShowBalances } from '@state/config/hooks';
import useWallets from '@hooks/useWallets';

const StyledReadyButton = styled(Button)`
  ${({ theme: { palette, spacing } }) => `
    border-color: ${colors[palette.mode].semantic.success.darker};
    background-color: ${colors[palette.mode].background.tertiary};
    color: ${colors[palette.mode].typography.typo1};
    padding: ${spacing(2)} ${spacing(4)} !important;
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
  const { userStrategies } = useEarnPositions();
  const readyDelayedWithdrawalPositions = React.useMemo(
    () => getDelayedWithdrawals({ userStrategies, withdrawStatus: DelayedWithdrawalStatus.READY }),
    [userStrategies]
  );

  const onClaimDelayedWithdraw = useEarnClaimDelayedWithdrawAction();
  const openConnectModal = useOpenConnectModal();
  const { trackEvent } = useAnalytics();
  const showBalances = useShowBalances();
  const wallets = useWallets();

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const intl = useIntl();

  const onReconnectWallet = () => {
    trackEvent('Earn - Strategy Table - Ready delayed Withdrawal - Reconnect wallet');
    openConnectModal(WalletActionType.reconnect);
  };

  const readyOptions = React.useMemo(
    () =>
      readyDelayedWithdrawalPositions.map<OptionsMenuOption>((position) => {
        const ownerWallet = wallets.find(({ address }) => address === position.owner);
        const isWalletConnected = ownerWallet?.status === WalletStatus.connected;

        const secondaryLabel = (
          <>
            {!isWalletConnected ? (
              <Typography variant="bodyExtraSmallBold" color={({ palette }) => colors[palette.mode].accentPrimary}>
                <Address address={position.owner} trimAddress />
              </Typography>
            ) : (
              <Address address={position.owner} trimAddress />
            )}
            {' · '}
            {showBalances ? (
              <>
                {'$'}
                {formatUsdAmount({ amount: position.totalReadyUsd, intl })}
              </>
            ) : (
              <HiddenNumber size="small" />
            )}
          </>
        );

        const onClick = isWalletConnected ? () => onClaimDelayedWithdraw(position) : onReconnectWallet;

        const handleClick = () => {
          onClick();
          setAnchorEl(null);
        };

        return {
          label: position.strategy.farm.name,
          secondaryLabel,
          type: OptionsMenuOptionType.option,
          Icon: TickCircleIcon,
          onClick: () => {},
          closeOnClick: false,
          control: !!position.pendingTransaction ? (
            <Button variant="outlined">
              <Link
                href={buildEtherscanTransaction(position.pendingTransaction, position.strategy.network.chainId)}
                target="_blank"
                rel="noreferrer"
                underline="none"
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Typography variant="bodySmallRegular" component="span">
                  <FormattedMessage description="pending transaction" defaultMessage="Pending transaction" />
                </Typography>
                <OpenInNewIcon style={{ fontSize: '1rem' }} />
              </Link>
            </Button>
          ) : (
            <StyledWithdrawButton variant="text" size="small" onClick={handleClick}>
              {isWalletConnected ? (
                <FormattedMessage
                  defaultMessage="Withdraw"
                  description="earn.strategies-table.ready-delayed-withdrawals.withdraw-button"
                />
              ) : (
                <FormattedMessage
                  defaultMessage="Switch"
                  description="earn.strategies-table.ready-delayed-withdrawals.switch-wallet-button"
                />
              )}
            </StyledWithdrawButton>
          ),
        };
      }),
    [readyDelayedWithdrawalPositions, wallets, intl, onReconnectWallet, onClaimDelayedWithdraw]
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
