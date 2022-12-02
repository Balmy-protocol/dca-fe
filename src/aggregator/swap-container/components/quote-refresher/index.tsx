import * as React from 'react';
import styled from 'styled-components';
import RefreshIcon from '@mui/icons-material/Refresh';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import { Typography } from '@mui/material';

const StyledRefresherContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StyledToggleTokenButton = styled(IconButton)`
  background-color: rgba(216, 216, 216, 0.1);
`;

interface QuoteRefresherProps {
  isLoading: boolean;
  refreshQuotes: () => void;
  disableRefreshQuotes: boolean;
}

const TIMER_FOR_RESET = 6000000;

// TODO RE-ENABLE THIS TO 60 FOR LAUNCH
// const TIMER_FOR_RESET = 60;

const QuoteRefresher = ({ isLoading, refreshQuotes, disableRefreshQuotes }: QuoteRefresherProps) => {
  const [timer, setTimer] = React.useState(TIMER_FOR_RESET);

  const onRefreshRoute = () => {
    setTimer(TIMER_FOR_RESET);
    refreshQuotes();
  };

  React.useEffect(() => {
    if (timer > 0 && !isLoading) {
      setTimeout(() => setTimer(timer - 1), 1000);
    } else {
      setTimer(TIMER_FOR_RESET);
      if (!isLoading && !disableRefreshQuotes) {
        refreshQuotes();
      }
    }
  }, [timer, refreshQuotes, isLoading]);

  return (
    <StyledRefresherContainer>
      <StyledToggleTokenButton
        aria-label="close"
        size="medium"
        onClick={onRefreshRoute}
        disabled={isLoading || disableRefreshQuotes}
      >
        <RefreshIcon fontSize="inherit" />
      </StyledToggleTokenButton>
      {!isLoading && timer !== TIMER_FOR_RESET && !disableRefreshQuotes && (
        <Typography variant="body1">
          <FormattedMessage
            description="refreshRouteTimer"
            defaultMessage="Refreshing routes in {timer}s"
            values={{ timer }}
          />
        </Typography>
      )}
    </StyledRefresherContainer>
  );
};

export default QuoteRefresher;
