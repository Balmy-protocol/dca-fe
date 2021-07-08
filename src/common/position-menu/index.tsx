import React from 'react';
import styled from 'styled-components';
import Slide from '@material-ui/core/Slide';
import { Position } from 'types';
import Button from 'common/button';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';

const StyledOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background-color: white;
  padding: 10px;
  display: flex;
  flex-direction: column;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 0;
`;

const StyledActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
`;

interface PositionMenuProps {
  position: Position;
  onClose: () => void;
  shouldShow: boolean;
}

const PositionMenu = ({ onClose, shouldShow }: PositionMenuProps) => {
  return (
    <Slide direction="up" in={shouldShow} mountOnEnter unmountOnExit>
      <StyledOverlay>
        <StyledHeader>
          <IconButton
            aria-label="close"
            size="small"
            onClick={onClose}
            style={{ position: 'absolute', top: '10px', right: '10px' }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
          <Typography variant="h6">
            <FormattedMessage description="position settings" defaultMessage="Position settings" />
          </Typography>
        </StyledHeader>
        <StyledActionsContainer>
          <Button variant="outlined" color="default" size="small" fullWidth>
            <FormattedMessage description="withdraw swapped" defaultMessage="Withdraw swapped" />
          </Button>
          <Button variant="outlined" color="default" size="small" fullWidth>
            <FormattedMessage description="withdraw funds" defaultMessage="Withdraw funds" />
          </Button>
          <Button variant="outlined" color="default" size="small" fullWidth>
            <FormattedMessage description="change duration" defaultMessage="Change duration" />
          </Button>
          <Button variant="contained" color="error" size="small" fullWidth>
            <FormattedMessage description="terminate position" defaultMessage="Terminate position" />
          </Button>
        </StyledActionsContainer>
      </StyledOverlay>
    </Slide>
  );
};

export default PositionMenu;
