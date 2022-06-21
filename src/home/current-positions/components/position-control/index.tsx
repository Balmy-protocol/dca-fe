import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Position } from 'types';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';
import { getProtocolToken, getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import useCurrentNetwork from 'hooks/useCurrentNetwork';

const PositionControlsContainer = styled.div`
  display: flex;
  align-self: flex-end;
  border-radius: 20px;
`;

const StyledMenu = withStyles(() =>
  createStyles({
    paper: {
      border: '2px solid #A5AAB5',
      borderRadius: '8px',
    },
  })
)(Menu);

interface CurrentPositionControlsProps {
  onWithdraw: (position: Position, useProtocolToken?: boolean) => void;
  position: Position;
  disabled: boolean;
}

const CurrentPositionControls = ({ onWithdraw, position, disabled }: CurrentPositionControlsProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const currentNetwork = useCurrentNetwork();
  const protocolToken = getProtocolToken(currentNetwork.chainId);
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <PositionControlsContainer>
      <IconButton onClick={handleClick}>
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
            onWithdraw(position);
          }}
          disabled={disabled}
        >
          <FormattedMessage
            description="withdraw"
            defaultMessage="Withdraw {wrappedProtocolToken}"
            values={{
              wrappedProtocolToken: position.to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.symbol : '',
            }}
          />
        </MenuItem>
        {position.to.address === PROTOCOL_TOKEN_ADDRESS && (
          <MenuItem
            onClick={() => {
              handleClose();
              onWithdraw(position, true);
            }}
            disabled={disabled}
          >
            <FormattedMessage
              description="withdraw"
              defaultMessage="Withdraw {protocolToken}"
              values={{ protocolToken: protocolToken.symbol }}
            />
          </MenuItem>
        )}
      </StyledMenu>
    </PositionControlsContainer>
  );
};

export default CurrentPositionControls;
