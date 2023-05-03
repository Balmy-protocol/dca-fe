import React from 'react';
import styled from 'styled-components';
import Button from 'common/button';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import usePushToHistory from 'hooks/usePushToHistory';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
`;
const PositionNotFound = () => {
  const pushToHistory = usePushToHistory();

  return (
    <StyledContainer>
      <Typography variant="h2">
        <SentimentVeryDissatisfiedIcon fontSize="inherit" />
      </Typography>

      <Typography variant="h4">
        <FormattedMessage
          description="positionNotFoundTitle"
          defaultMessage="This position does not appear to be indexed yet"
        />
      </Typography>

      <Typography variant="h5">
        <FormattedMessage
          description="positionNotFoundDescription"
          defaultMessage="If you have just created the position, wait a few minutes and try again."
        />
      </Typography>

      <Button variant="contained" color="secondary" onClick={() => pushToHistory('/')} style={{ marginTop: '10px' }}>
        <Typography variant="body1">
          <FormattedMessage description="goBackToPositions" defaultMessage="View your positions" />
        </Typography>
      </Button>
    </StyledContainer>
  );
};
export default PositionNotFound;
