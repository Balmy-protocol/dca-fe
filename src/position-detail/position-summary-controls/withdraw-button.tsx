import React from 'react';
import Button from 'common/button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import { FormattedMessage } from 'react-intl';
import { FullPosition } from 'types';
import { getProtocolToken, getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import useCurrentNetwork from 'hooks/useCurrentNetwork';

interface WithdrawButtonProps {
  onClick: (useProtocolToken: boolean) => void;
  disabled: boolean;
  position: FullPosition;
}

const WithdrawButton = ({ onClick, disabled, position }: WithdrawButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const currentNetwork = useCurrentNetwork();
  const protocolToken = getProtocolToken(currentNetwork.chainId);
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
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
