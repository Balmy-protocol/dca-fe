import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Position, WalletStatus } from '@types';
import { IconButton, Menu, MenuItem, MoreVertIcon, createStyles, Button, SplitButton } from 'ui-library';
import { withStyles } from 'tss-react/mui';
import {
  DCA_TOKEN_BLACKLIST,
  LATEST_VERSION,
  shouldEnableFrequency,
  DISABLED_YIELD_WITHDRAWS,
  DCA_PAIR_BLACKLIST,
  CHAIN_CHANGING_WALLETS_WITHOUT_REFRESH,
} from '@constants';
import useSupportsSigning from '@hooks/useSupportsSigning';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';

// import useActiveWallet from '@hooks/useActiveWallet';
import useWallets from '@hooks/useWallets';
import useWallet from '@hooks/useWallet';
import useWalletNetwork from '@hooks/useWalletNetwork';

const StyledButton = styled(Button)`
  border-radius: 30px;
  padding: 11px 16px;
  cursor: pointer;
  padding: 4px 8px;
`;

const PositionControlsContainer = styled.div`
  display: flex;
  align-self: flex-end;
  gap: 10px;
`;

const PositionControlsMenuContainer = styled.div`
  display: flex;
  align-self: flex-end;
  border-radius: 20px;
`;

const StyledMenu = withStyles(Menu, () =>
  createStyles({
    paper: {
      borderRadius: '8px',
    },
  })
);

interface PositionSummaryControlsProps {
  onTerminate: () => void;
  onModifyRate: () => void;
  onTransfer: () => void;
  onViewNFT: () => void;
  onWithdrawFunds: () => void;
  pendingTransaction: string | null;
  position: Position;
  onWithdraw: (useProtocolToken: boolean) => void;
}

const PositionSummaryControls = ({
  onTerminate,
  onModifyRate,
  onTransfer,
  onWithdrawFunds,
  onWithdraw,
  pendingTransaction,
  position,
  onViewNFT,
}: PositionSummaryControlsProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  // const activeWallet = useActiveWallet();
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const wallets = useWallets();
  const fromHasYield = !!position.from.underlyingTokens.length;
  const toHasYield = !!position.to.underlyingTokens.length;
  const isPending = pendingTransaction !== null;
  // const account = activeWallet?.address;
  const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);
  const hasSignSupport = useSupportsSigning();
  const wallet = useWallet(position.user);
  const [connectedNetwork] = useWalletNetwork(position.user);

  const isOnNetwork = connectedNetwork?.chainId === position.chainId;
  const walletIsConnected = wallet.status === WalletStatus.connected;

  const showSwitchAction =
    walletIsConnected && !isOnNetwork && !CHAIN_CHANGING_WALLETS_WITHOUT_REFRESH.includes(wallet.providerInfo.name);

  const isOwner = wallets.find((userWallet) => userWallet.address.toLowerCase() === position.user.toLowerCase());

  const disabled = showSwitchAction || !walletIsConnected;

  if (!isOwner) return null;

  const showExtendedFunctions =
    position.version === LATEST_VERSION &&
    !DCA_PAIR_BLACKLIST.includes(position.pairId) &&
    !DCA_TOKEN_BLACKLIST.includes(position.from.address) &&
    !DCA_TOKEN_BLACKLIST.includes((fromHasYield && position.from.underlyingTokens[0]?.address) || '') &&
    !DCA_TOKEN_BLACKLIST.includes((toHasYield && position.to.underlyingTokens[0]?.address) || '') &&
    shouldEnableFrequency(
      position.swapInterval.toString(),
      position.from.address,
      position.to.address,
      position.chainId
    );

  const disabledWithdraw =
    disabled || DISABLED_YIELD_WITHDRAWS.includes((toHasYield && position.to.underlyingTokens[0]?.address) || '');
  const disabledWithdrawFunds =
    disabled || DISABLED_YIELD_WITHDRAWS.includes((fromHasYield && position.from.underlyingTokens[0]?.address) || '');

  const disableModifyPosition = isPending || disabled;
  const shouldShowWithdrawWrappedToken =
    BigInt(position.toWithdraw) > 0n && hasSignSupport && position.to.address === PROTOCOL_TOKEN_ADDRESS;
  const shouldDisableArrow =
    isPending || disabled || (!shouldShowWithdrawWrappedToken && BigInt(position.remainingLiquidity) <= 0n);

  return (
    <PositionControlsContainer>
      {showExtendedFunctions && (
        <Button variant="outlined" disabled={disableModifyPosition} onClick={onModifyRate}>
          <FormattedMessage description="managePosition" defaultMessage="Manage position" />
        </Button>
      )}

      {shouldDisableArrow && (
        <StyledButton
          variant="outlined"
          size="small"
          disabled={disabledWithdraw || isPending || disabled || BigInt(position.toWithdraw) <= 0n}
          onClick={() => onWithdraw(!!hasSignSupport && position.to.address === PROTOCOL_TOKEN_ADDRESS)}
        >
          <FormattedMessage
            description="withdrawToken"
            defaultMessage="Withdraw {token}"
            values={{
              token:
                hasSignSupport || position.to.address !== PROTOCOL_TOKEN_ADDRESS
                  ? position.to.symbol
                  : wrappedProtocolToken.symbol,
            }}
          />
        </StyledButton>
      )}

      {!shouldDisableArrow && (
        <SplitButton
          onClick={() => onWithdraw(!!hasSignSupport && position.to.address === PROTOCOL_TOKEN_ADDRESS)}
          text={
            <FormattedMessage
              description="withdrawToken"
              defaultMessage="Withdraw {token}"
              values={{
                token:
                  hasSignSupport || position.to.address !== PROTOCOL_TOKEN_ADDRESS
                    ? position.to.symbol
                    : wrappedProtocolToken.symbol,
              }}
            />
          }
          disabled={disabledWithdraw || isPending || disabled || BigInt(position.toWithdraw) <= 0n}
          variant="outlined"
          color="secondary"
          options={[
            ...(shouldShowWithdrawWrappedToken
              ? [
                  {
                    text: (
                      <FormattedMessage
                        description="withdrawWrapped"
                        defaultMessage="Withdraw {wrappedProtocolToken}"
                        values={{
                          wrappedProtocolToken: wrappedProtocolToken.symbol,
                        }}
                      />
                    ),
                    disabled: disabledWithdraw || isPending || disabled,
                    onClick: () => onWithdraw(false),
                  },
                ]
              : []),
            {
              text: (
                <FormattedMessage
                  description="withdraw funds"
                  defaultMessage="Withdraw remaining {token}"
                  values={{ token: position.from.symbol }}
                />
              ),
              disabled: disabledWithdrawFunds || isPending || disabled || BigInt(position.remainingLiquidity) <= 0n,
              onClick: onWithdrawFunds,
            },
          ]}
        />
      )}

      <PositionControlsMenuContainer>
        <IconButton onClick={handleClick} disabled={isPending}>
          <MoreVertIcon />
        </IconButton>
        <StyledMenu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem
            onClick={() => {
              handleClose();
              onViewNFT();
            }}
            disabled={disabled}
          >
            <FormattedMessage description="view nft" defaultMessage="View NFT" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              onTransfer();
            }}
            disabled={isPending || disabled}
          >
            <FormattedMessage description="transferPosition" defaultMessage="Transfer position" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              onTerminate();
            }}
            disabled={isPending || disabled || disabledWithdraw || !showExtendedFunctions}
          >
            <FormattedMessage description="terminate position" defaultMessage="Withdraw and close position" />
          </MenuItem>
        </StyledMenu>
      </PositionControlsMenuContainer>
    </PositionControlsContainer>
  );
};

export default PositionSummaryControls;
