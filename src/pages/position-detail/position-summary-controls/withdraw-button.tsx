import React from 'react';
import Button from 'common/components/button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import { FormattedMessage } from 'react-intl';
import { FullPosition } from 'types';
import { getProtocolToken, getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'common/mocks/tokens';

interface WithdrawButtonProps {
  onClick: (useProtocolToken: boolean) => void;
  disabled: boolean;
  position: FullPosition;
}

const WithdrawButton = ({ onClick, disabled, position }: WithdrawButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const protocolToken = getProtocolToken(position.chainId);
  const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <ButtonGroup ref={anchorRef} aria-label="split button">
        <Button
          variant="contained"
          color="white"
          onClick={() => onClick(position.to.address === PROTOCOL_TOKEN_ADDRESS)}
          disabled={disabled}
        >
          <FormattedMessage
            description="withdraw swapped"
            defaultMessage="Withdraw {to}"
            values={{
              to: position.to.symbol,
            }}
          />
        </Button>
        <Button
          color="white"
          size="small"
          variant="contained"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
          disabled={disabled}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <Button
                  variant="contained"
                  color="white"
                  onClick={() => onClick(position.to.address !== PROTOCOL_TOKEN_ADDRESS)}
                  disabled={disabled}
                >
                  <FormattedMessage
                    description="withdraw swapped as"
                    defaultMessage="Withdraw as {to}"
                    values={{
                      to:
                        position.to.address === PROTOCOL_TOKEN_ADDRESS
                          ? wrappedProtocolToken.symbol
                          : protocolToken.symbol,
                    }}
                  />
                </Button>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default WithdrawButton;
