import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Typography, SentimentVeryDissatisfiedIcon, Button } from 'ui-library';
import usePushToHistory from '@hooks/usePushToHistory';

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

      <Button variant="contained" onClick={() => pushToHistory('/invest/positions')} style={{ marginTop: '10px' }}>
        <Typography variant="bodyRegular">
          <FormattedMessage description="goBackToPositions" defaultMessage="View your positions" />
        </Typography>
      </Button>
    </StyledContainer>
  );
};
export default PositionNotFound;
