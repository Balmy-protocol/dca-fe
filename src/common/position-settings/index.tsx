import React from 'react';
import styled from 'styled-components';
import Button from 'common/button';
import { FormattedMessage } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import { useHistory } from 'react-router-dom';

const StyledActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
  positionId: string;
}

const PositionSettings = ({ onWithdraw, onModifyRate, onRemoveFunds, onClose, positionId }: PositionSettingsProps) => {
  const history = useHistory();

  const onViewDetails = () => {
    history.push(`/positions/${positionId}`);
  };

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
          <FormattedMessage description="withdraw funds" defaultMessage="Withdraw deposited" />
        </Button>
        <Button variant="outlined" color="default" size="small" fullWidth onClick={onModifyRate}>
          <FormattedMessage description="change rate" defaultMessage="Change duration and rate" />
        </Button>
        <Button variant="contained" color="secondary" size="small" fullWidth onClick={onViewDetails}>
          <FormattedMessage description="view details" defaultMessage="View details" />
        </Button>
      </StyledActionsContainer>
    </>
  );
};

export default PositionSettings;
