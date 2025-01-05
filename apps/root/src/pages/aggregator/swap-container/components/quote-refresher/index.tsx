import * as React from 'react';
import { SvgIcon, colors, ContainerBox, Typography } from 'ui-library';
import useAnalytics from '@hooks/useAnalytics';
import { useThemeMode } from '@state/config/hooks';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';

const StyledRefreshContainer = styled(ContainerBox).attrs({ gap: 1, alignItems: 'center' })<{ $disabled: boolean }>`
  ${({ theme: { spacing }, $disabled }) => `
  padding: 0 ${spacing(2)};
  ${!$disabled && 'cursor: pointer;'}
  `}
`;

const StyledRefreshText = styled(Typography).attrs({ variant: 'bodySmallBold' })<{ $disabled: boolean }>`
  ${({ theme: { palette }, $disabled }) => `
     color ${$disabled ? colors[palette.mode].typography.typo5 : colors[palette.mode].typography.typo3};
  `}
`;

interface QuoteRefresherProps {
  isLoading: boolean;
  refreshQuotes: () => void;
  disableRefreshQuotes: boolean;
}

const TIMER_FOR_RESET = 60;

const CustomRefresherIcon = ({ fill, disabled }: { fill: number; disabled: boolean }) => {
  const mode = useThemeMode();

  const color = disabled ? colors[mode].typography.typo5 : colors[mode].typography.typo3;
  return (
    <SvgIcon fontSize="inherit" viewBox="0 0 100 100">
      <svg id="countdown-spinner" viewBox="0 0 100 100" height="100%">
        <g>
          <path d="M50 15A35 35 0 1 0 74.787 25.213" fill="none" stroke={color} strokeWidth="12" strokeOpacity="0.3" />
          <path d="M50 0L50 30L66 15L50 0" fill={color} fillOpacity="0.3" />
        </g>
        <g>
          <path
            style={{ transition: 'all 1s ease-in-out' }}
            d="M50 15A35 35 0 1 0 74.787 25.213"
            fill="none"
            stroke={color}
            pathLength="60"
            strokeDasharray="60"
            strokeDashoffset={(-60 * fill) / 100}
            strokeWidth="12"
          />
        </g>
      </svg>
    </SvgIcon>
  );
};

const QuoteRefresher = ({ isLoading, refreshQuotes, disableRefreshQuotes }: QuoteRefresherProps) => {
  const [timer, setTimer] = React.useState(TIMER_FOR_RESET);
  const inactiveTimeRef = React.useRef<number | null>(null);
  const { trackEvent } = useAnalytics();

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

  const timerPercentage = disableRefreshQuotes ? 100 : (timer * 100) / TIMER_FOR_RESET;
  const disabled = isLoading || disableRefreshQuotes;
  return (
    <StyledRefreshContainer onClick={onRefreshRoute} $disabled={disabled}>
      <CustomRefresherIcon fill={timerPercentage} disabled={disabled} />
      <StyledRefreshText $disabled={disabled}>
        <FormattedMessage description="refreshQuotes" defaultMessage="Refresh" />
      </StyledRefreshText>
    </StyledRefreshContainer>
  );
};

export default QuoteRefresher;
