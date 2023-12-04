import * as React from 'react';
import styled from 'styled-components';
import { SvgIcon, IconButton } from 'ui-library';
import useTrackEvent from '@hooks/useTrackEvent';

const StyledRefresherContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StyledToggleTokenButton = styled(IconButton)``;

interface QuoteRefresherProps {
  isLoading: boolean;
  refreshQuotes: () => void;
  disableRefreshQuotes: boolean;
}

const TIMER_FOR_RESET = 60;

const CustomRefresherIcon = ({ fill }: { fill: number }) => (
  <SvgIcon fontSize="inherit" viewBox="0 0 100 100">
    <svg id="countdown-spinner" viewBox="0 0 100 100" height="100%">
      <g>
        <path d="M50 15A35 35 0 1 0 74.787 25.213" fill="none" stroke="white" strokeWidth="12" strokeOpacity="0.3" />
        <path d="M50 0L50 30L66 15L50 0" fill="white" fillOpacity="0.3" />
      </g>
      <g>
        <path
          style={{ transition: 'all 1s ease-in-out' }}
          d="M50 15A35 35 0 1 0 74.787 25.213"
          fill="none"
          stroke="white"
          pathLength="60"
          strokeDasharray="60"
          strokeDashoffset={(-60 * fill) / 100}
          strokeWidth="12"
        />
      </g>
    </svg>
  </SvgIcon>
);

const QuoteRefresher = ({ isLoading, refreshQuotes, disableRefreshQuotes }: QuoteRefresherProps) => {
  const [timer, setTimer] = React.useState(TIMER_FOR_RESET);
  const inactiveTimeRef = React.useRef<number | null>(null);
  const trackEvent = useTrackEvent();

  const onRefreshRoute = () => {
    setTimer(TIMER_FOR_RESET);
    refreshQuotes();
    trackEvent('Aggregator - Refresh quotes');
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      if (inactiveTimeRef.current && inactiveTimeRef.current + 60 * 1000 < Date.now()) {
        setTimer(TIMER_FOR_RESET);
        refreshQuotes();
      } else {
        setTimeout(() => setTimer((newTimer) => newTimer - 1), 1000);
      }
    } else {
      inactiveTimeRef.current = Date.now();
    }
  };

  React.useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  React.useEffect(() => {
    if (document.visibilityState !== 'visible') {
      return;
    }

    if (timer > 0 && !isLoading) {
      setTimeout(() => setTimer(timer - 1), 1000);
    } else {
      setTimer(TIMER_FOR_RESET);
      if (!isLoading && !disableRefreshQuotes) {
        refreshQuotes();
      }
    }
  }, [timer, refreshQuotes, isLoading]);

  const timerPercentage = (timer * 100) / TIMER_FOR_RESET;
  return (
    <StyledRefresherContainer>
      <StyledToggleTokenButton
        aria-label="close"
        size="small"
        onClick={onRefreshRoute}
        disabled={isLoading || disableRefreshQuotes}
      >
        <CustomRefresherIcon fill={timerPercentage} />
      </StyledToggleTokenButton>
    </StyledRefresherContainer>
  );
};

export default QuoteRefresher;
