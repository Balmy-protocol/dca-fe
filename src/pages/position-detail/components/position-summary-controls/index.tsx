import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { FullPosition } from '@types';
import { useAccountPermissions, mergeCompanionPermissions } from '@state/position-permissions/hooks';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';
import {
  DCA_TOKEN_BLACKLIST,
  LATEST_VERSION,
  shouldEnableFrequency,
  DISABLED_YIELD_WITHDRAWS,
  DCA_PAIR_BLACKLIST,
  COMPANION_ADDRESS,
} from '@constants';
import Button from '@common/components/button';
import SplitButton from '@common/components/split-button';
import useSupportsSigning from '@hooks/useSupportsSigning';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { BigNumber } from 'ethers';

const StyledButton = styled(Button)`
  border-radius: 30px;
  padding: 11px 16px;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.302), 0 1px 3px 1px rgba(60, 64, 67, 0.149);
  :hover {
    box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.302), 0 4px 8px 3px rgba(60, 64, 67, 0.149);
  }
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
  background-color: rgba(216, 216, 216, 0.05);
`;

const StyledMenu = withStyles(() =>
  createStyles({
    paper: {
      border: '2px solid #A5AAB5',
      borderRadius: '8px',
    },
  })
)(Menu);

interface PositionSummaryControlsProps {
  onTerminate: () => void;
  onModifyRate: () => void;
  onTransfer: () => void;
  onViewNFT: () => void;
  onWithdrawFunds: (useProtocolToken?: boolean) => void;
  pendingTransaction: string | null;
  position: FullPosition;
  disabled: boolean;
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
  disabled,
}: PositionSummaryControlsProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const fromHasYield = !!position.from.underlyingTokens.length;
  const toHasYield = !!position.to.underlyingTokens.length;
  const isPending = pendingTransaction !== null;
  const companionAddress =
    COMPANION_ADDRESS[position.version][position.chainId] || COMPANION_ADDRESS[LATEST_VERSION][position.chainId];
  const companionPermissions = useAccountPermissions(position.id, position.user, companionAddress.toLowerCase());
  const isToProtocolToken = position.to.address === PROTOCOL_TOKEN_ADDRESS;
  const isFromProtocolToken = position.from.address === PROTOCOL_TOKEN_ADDRESS;
  const hasYield = !!(position.to.underlyingTokens.length || position.from.underlyingTokens.length);
  const accountPermissions = useAccountPermissions(position.id, position.user);
  const mergedPermissions = hasYield
    ? mergeCompanionPermissions(accountPermissions, companionPermissions)
    : accountPermissions;
  const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);
  const hasSignSupport = useSupportsSigning();
  const canWithdrawProtocolToken = !!(hasSignSupport && (accountPermissions.isOwner || companionPermissions.WITHDRAW));
  const canOnlyWithdrawWrappedToProtocolToken = !canWithdrawProtocolToken && isToProtocolToken;

  if (
    !accountPermissions.INCREASE &&
    !accountPermissions.REDUCE &&
    !accountPermissions.WITHDRAW &&
    !accountPermissions.TERMINATE
  )
    return null;

  const showExtendedFunctions =
    position.version === LATEST_VERSION &&
    !DCA_PAIR_BLACKLIST.includes(position.pair.id) &&
    !DCA_TOKEN_BLACKLIST.includes(position.from.address) &&
    !DCA_TOKEN_BLACKLIST.includes((fromHasYield && position.from.underlyingTokens[0]?.address) || '') &&
    !DCA_TOKEN_BLACKLIST.includes((toHasYield && position.to.underlyingTokens[0]?.address) || '') &&
    shouldEnableFrequency(
      position.swapInterval.interval,
      position.from.address,
      position.to.address,
      position.chainId
    ) &&
    (mergedPermissions.INCREASE || mergedPermissions.REDUCE);

  const disabledWithdraw =
    disabled || DISABLED_YIELD_WITHDRAWS.includes((toHasYield && position.to.underlyingTokens[0]?.address) || '');
  const disabledWithdrawFunds =
    disabled || DISABLED_YIELD_WITHDRAWS.includes((fromHasYield && position.from.underlyingTokens[0]?.address) || '');

  const disableModifyPosition = isPending || disabled;
  const shouldShowWithdrawWrappedToken =
    BigNumber.from(position.toWithdraw).gt(BigNumber.from(0)) &&
    hasSignSupport &&
    position.to.address === PROTOCOL_TOKEN_ADDRESS;
  const shouldDisableArrow =
    isPending ||
    disabled ||
    (!shouldShowWithdrawWrappedToken && BigNumber.from(position.remainingLiquidity).lte(BigNumber.from(0)));

  return (
    <PositionControlsContainer>
      {showExtendedFunctions && (
        <StyledButton
          variant="outlined"
          color="transparent"
          size="small"
          disabled={disableModifyPosition}
          onClick={onModifyRate}
        >
          <FormattedMessage description="modifyPosition" defaultMessage="Modify position" />
        </StyledButton>
      )}

      {!shouldDisableArrow && mergedPermissions.WITHDRAW && mergedPermissions.REDUCE && (
        <SplitButton
          onClick={() => onWithdraw(!!hasSignSupport && isToProtocolToken && canWithdrawProtocolToken)}
          text={
            <FormattedMessage
              description="withdrawToken"
              defaultMessage="Withdraw {token}"
              values={{
                token: canOnlyWithdrawWrappedToProtocolToken ? wrappedProtocolToken.symbol : position.to.symbol,
              }}
            />
          }
          disabled={
            disabledWithdraw || isPending || disabled || BigNumber.from(position.toWithdraw).lte(BigNumber.from(0))
          }
          variant="outlined"
          color="transparent"
          options={[
            ...(BigNumber.from(position.toWithdraw).gt(BigNumber.from(0)) &&
            isToProtocolToken &&
            !!hasSignSupport &&
            !canOnlyWithdrawWrappedToProtocolToken
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
              disabled:
                disabledWithdrawFunds ||
                isPending ||
                disabled ||
                BigNumber.from(position.remainingLiquidity).lte(BigNumber.from(0)) ||
                (isFromProtocolToken && !canWithdrawProtocolToken),
              onClick: onWithdrawFunds,
            },
            ...(isFromProtocolToken
              ? [
                  {
                    text: (
                      <FormattedMessage
                        description="withdrawWrapped"
                        defaultMessage="Withdraw remaining as {wrappedProtocolToken}"
                        values={{
                          wrappedProtocolToken: wrappedProtocolToken.symbol,
                        }}
                      />
                    ),
                    disabled:
                      isPending || disabled || BigNumber.from(position.remainingLiquidity).lte(BigNumber.from(0)),
                    onClick: () => onWithdrawFunds(false),
                  },
                ]
              : []),
          ]}
        />
      )}
      {shouldDisableArrow && mergedPermissions.WITHDRAW && !mergedPermissions.REDUCE && (
        <StyledButton
          variant="outlined"
          color="transparent"
          size="small"
          disabled={
            disabledWithdraw ||
            isPending ||
            disabled ||
            BigNumber.from(position.toWithdraw).lte(BigNumber.from(0)) ||
            !mergedPermissions.WITHDRAW
          }
          onClick={() => onWithdraw(!!hasSignSupport && isToProtocolToken && canWithdrawProtocolToken)}
        >
          <FormattedMessage
            description="withdrawToken"
            defaultMessage="Withdraw {token}"
            values={{
              token: canOnlyWithdrawWrappedToProtocolToken ? wrappedProtocolToken.symbol : position.to.symbol,
            }}
          />
        </StyledButton>
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
          {accountPermissions.isOwner && (
            <MenuItem
              onClick={() => {
                handleClose();
                onTransfer();
              }}
              disabled={isPending || disabled}
            >
              <FormattedMessage description="transferPosition" defaultMessage="Transfer position" />
            </MenuItem>
          )}
          {accountPermissions.TERMINATE && (
            <MenuItem
              onClick={() => {
                handleClose();
                onTerminate();
              }}
              disabled={isPending || disabled || disabledWithdraw || !showExtendedFunctions}
              style={{ color: '#FF5359' }}
            >
              <FormattedMessage description="terminate position" defaultMessage="Withdraw and close position" />
            </MenuItem>
          )}
        </StyledMenu>
      </PositionControlsMenuContainer>
    </PositionControlsContainer>
  );
};

export default PositionSummaryControls;
