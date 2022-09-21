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
import { LATEST_VERSION } from 'config';

const PositionControlsContainer = styled.div`
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
}

const PositionSummaryControls = ({
  onTerminate,
  onModifyRate,
  onTransfer,
  onWithdrawFunds,
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
  const isPending = pendingTransaction !== null;
  const web3Service = useWeb3Service();
  const account = web3Service.getAccount();

  if (!account || account.toLowerCase() !== position.user.toLowerCase()) return null;

  const showExtendedFunctions = position.version === LATEST_VERSION;

  return (
    <PositionControlsContainer>
      <IconButton onClick={handleClick} disabled={isPending}>
        <MoreVertIcon />
      </IconButton>
      <StyledMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
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
            onWithdrawFunds();
          }}
          disabled={isPending || disabled}
        >
          <FormattedMessage description="withdraw funds" defaultMessage="Withdraw funds" />
        </MenuItem>
        {!showExtendedFunctions && (
          <MenuItem
            onClick={() => {
              handleClose();
              onModifyRate();
            }}
            disabled={isPending || disabled}
          >
            <FormattedMessage description="change rate" defaultMessage="Change duration and rate" />
          </MenuItem>
        )}
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
          disabled={isPending || disabled}
          style={{ color: '#FF5359' }}
        >
          <FormattedMessage description="terminate position" defaultMessage="Terminate position" />
        </MenuItem>
      </StyledMenu>
    </PositionControlsContainer>
  );
};

export default PositionSummaryControls;
