import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { FullPosition } from 'types';
import useWeb3Service from 'hooks/useWeb3Service';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';
import { TOKEN_BLACKLIST, LATEST_VERSION, shouldEnableFrequency, DISABLED_YIELD_WITHDRAWS } from 'config';
import Button from 'common/button';
import SplitButton from 'common/split-button';
import useSupportsSigning from 'hooks/useSupportsSigning';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
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
  onWithdrawFunds: () => void;
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
  const web3Service = useWeb3Service();
  const account = web3Service.getAccount();
  const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);
  const [hasSignSupport] = useSupportsSigning();

  if (!account || account.toLowerCase() !== position.user.toLowerCase()) return null;

  const showExtendedFunctions =
    position.version === LATEST_VERSION &&
    !TOKEN_BLACKLIST.includes(position.from.address) &&
    !TOKEN_BLACKLIST.includes((fromHasYield && position.from.underlyingTokens[0]?.address) || '') &&
    !TOKEN_BLACKLIST.includes((toHasYield && position.to.underlyingTokens[0]?.address) || '') &&
    shouldEnableFrequency(position.swapInterval.interval, position.from.address, position.to.address, position.chainId);

  const disabledWithdraw =
    disabled || DISABLED_YIELD_WITHDRAWS.includes((toHasYield && position.to.underlyingTokens[0]?.address) || '');
  const disabledWithdrawFunds =
    disabled || DISABLED_YIELD_WITHDRAWS.includes((fromHasYield && position.from.underlyingTokens[0]?.address) || '');

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
          disabled={isPending || disabled}
          onClick={onModifyRate}
        >
          <FormattedMessage description="modifyPosition" defaultMessage="Modify position" />
        </StyledButton>
      )}

      {shouldDisableArrow && (
        <StyledButton
          variant="outlined"
          color="transparent"
          size="small"
          disabled={
            disabledWithdraw || isPending || disabled || BigNumber.from(position.toWithdraw).lte(BigNumber.from(0))
          }
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
          disabled={
            disabledWithdraw || isPending || disabled || BigNumber.from(position.toWithdraw).lte(BigNumber.from(0))
          }
          variant="outlined"
          color="transparent"
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
              disabled:
                disabledWithdrawFunds ||
                isPending ||
                disabled ||
                BigNumber.from(position.remainingLiquidity).lte(BigNumber.from(0)),
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
            style={{ color: '#FF5359' }}
          >
            <FormattedMessage description="terminate position" defaultMessage="Withdraw and close position" />
          </MenuItem>
        </StyledMenu>
      </PositionControlsMenuContainer>
    </PositionControlsContainer>
  );
};

export default PositionSummaryControls;
