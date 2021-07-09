import React from 'react';
import styled from 'styled-components';
import Button from 'common/button';
import { FormattedMessage } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

const StyledActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 0;
`;

interface PositionSettingsProps {
  onWithdraw: () => void;
  onTerminate: () => void;
  onModifyRate: () => void;
  onRemoveFunds: () => void;
  onClose: () => void;
}

const PositionSettings = ({ onWithdraw, onTerminate, onModifyRate, onRemoveFunds, onClose }: PositionSettingsProps) => {
  return (
    <>
      <StyledHeader>
        <IconButton
          aria-label="close"
          size="small"
          onClick={onClose}
          style={{ position: 'absolute', top: '10px', right: '25px' }}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
        <Typography variant="h6">
          <FormattedMessage description="position settings" defaultMessage="Position settings" />
        </Typography>
      </StyledHeader>
      <StyledActionsContainer>
        <Button variant="outlined" color="default" size="small" fullWidth onClick={onWithdraw}>
          <FormattedMessage description="withdraw swapped" defaultMessage="Withdraw swapped" />
        </Button>
        <Button variant="outlined" color="default" size="small" fullWidth onClick={onRemoveFunds}>
          <FormattedMessage description="withdraw funds" defaultMessage="Withdraw funds" />
        </Button>
        <Button variant="outlined" color="default" size="small" fullWidth onClick={onModifyRate}>
          <FormattedMessage description="change duration" defaultMessage="Change duration" />
        </Button>
        <Button variant="contained" color="error" size="small" fullWidth onClick={onTerminate}>
          <FormattedMessage description="terminate position" defaultMessage="Terminate position" />
        </Button>
      </StyledActionsContainer>
    </>
  );
};

export default PositionSettings;
