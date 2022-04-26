import React from 'react';
import styled from 'styled-components';
import Button from 'common/button';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

const StyledActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  flex-grow: 1;
  padding: 10px 0px;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 0;
`;

interface PositionSettingsProps {
  onWithdraw: () => void;
  onModifyRate: () => void;
  onRemoveFunds: () => void;
  onClose: () => void;
}

const PositionSettings = ({ onWithdraw, onModifyRate, onRemoveFunds, onClose }: PositionSettingsProps) => (
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
        <FormattedMessage description="withdraw funds" defaultMessage="Withdraw deposited" />
      </Button>
      <Button variant="outlined" color="default" size="small" fullWidth onClick={onModifyRate}>
        <FormattedMessage description="change rate" defaultMessage="Change duration and rate" />
      </Button>
    </StyledActionsContainer>
  </>
);

export default PositionSettings;
