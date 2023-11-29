import * as React from 'react';
import { CircularProgress, Popover, Grid, Typography, Box, ErrorOutlineIcon, createStyles, Button } from 'ui-library';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { SwapOption } from '@types';
import { useAggregatorState } from '@state/aggregator/hooks';
import TokenIcon from '@common/components/token-icon';
import { emptyTokenWithDecimals, emptyTokenWithLogoURI, formatCurrencyAmount } from '@common/utils/currency';
import { BigNumber } from 'ethers';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import { getBetterBy, getBetterByLabel, getWorseBy, getWorseByLabel } from '@common/utils/quotes';
import { setSelectedRoute } from '@state/aggregator/actions';
import { useAppDispatch } from '@state/hooks';
import { withStyles } from 'tss-react/mui';
import useTrackEvent from '@hooks/useTrackEvent';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useIsPermit2Enabled from '@hooks/useIsPermit2Enabled';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { SORT_MOST_PROFIT } from '@constants/aggregator';
import QuoteRefresher from '../quote-refresher';
import QuoteList from '../quote-list';

const StyledContainer = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  background: rgba(216, 216, 216, 0.1);
  box-shadow: inset 1px 1px 0px rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.5);
  gap: 10px;
`;

const StyledCenteredWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
`;

const StyledQuoteContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledSwapperContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StyledBetterByContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
`;

interface SwapQuotesProps {
  quotes: SwapOption[];
  isLoading: boolean;
  fetchOptions: () => void;
  refreshQuotes: boolean;
  bestQuote?: SwapOption | null;
  swapOptionsError?: string;
}

const StyledTopCircularProgress = withStyles(CircularProgress, () =>
  createStyles({
    circle: {
      strokeLinecap: 'round',
    },
  })
);

const StyledCircularContainer = styled.div`
  align-self: stretch;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledBottomCircularProgress = withStyles(CircularProgress, () =>
  createStyles({
    root: {
      color: 'rgba(255, 255, 255, 0.05)',
    },
    circle: {
      strokeLinecap: 'round',
    },
  })
);

const TransactionsProgress = ({ showSimulate }: { showSimulate: boolean }) => {
  const [timer, setTimer] = React.useState(0);
  const [timerStarted, startTimer] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (timerStarted && timer < 9) {
      timerRef.current = setTimeout(() => setTimer(timer + 1), 333);
    }

    if (!timerStarted && showSimulate) {
      setTimeout(() => startTimer(true), 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer, timerStarted]);

  if (!timerStarted || !showSimulate) {
    return (
      <>
        <CenteredLoadingIndicator size={40} noFlex />
        <FormattedMessage description="loadingBestRoute" defaultMessage="Fetching the best route for you" />
      </>
    );
  }

  return (
    <>
      <StyledCircularContainer>
        <StyledBottomCircularProgress
          size={40}
          variant="determinate"
          value={100}
          thickness={4}
          sx={{ position: 'absolute' }}
        />
        <StyledTopCircularProgress size={40} variant="determinate" value={(1 - (9 - timer) / 9) * 100} thickness={4} />
      </StyledCircularContainer>
      <FormattedMessage
        description="quoteSelectionSimulatingQuotes"
        defaultMessage="Simulating transactions ({current}/{total})"
        values={{
          total: 9,
          current: timer,
        }}
      />
    </>
  );
};

const QuoteSelection = ({
  quotes,
  isLoading,
  fetchOptions,
  refreshQuotes,
  bestQuote,
  swapOptionsError,
}: SwapQuotesProps) => {
  const { isBuyOrder, selectedRoute, from } = useAggregatorState();
  const { sorting } = useAggregatorSettingsState();
  const currentNetwork = useSelectedNetwork();
  const isPermit2Enabled = useIsPermit2Enabled(currentNetwork.chainId);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();
  const intl = useIntl();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeSelectedRoute = (newRoute: SwapOption) => {
    dispatch(setSelectedRoute(newRoute));
    trackEvent('Aggregator - Change selected route', {
      fromSource: selectedRoute?.swapper.id,
      toSource: newRoute.swapper.id,
    });
  };

  if (!quotes.length && !isLoading && !!swapOptionsError) {
    return (
      <StyledContainer>
        <StyledCenteredWrapper>
          <ErrorOutlineIcon fontSize="large" />
          <Typography variant="h6">
            <FormattedMessage
              description="All routes failed"
              defaultMessage="We could not fetch a route for your swap"
            />
          </Typography>
          <Button variant="contained" color="secondary" onClick={fetchOptions}>
            <FormattedMessage description="All routes failed action" defaultMessage="Try to get a route again" />
          </Button>
        </StyledCenteredWrapper>
      </StyledContainer>
    );
  }

  const isBestQuote = bestQuote?.swapper.id === selectedRoute?.swapper.id;

  const betterBy = selectedRoute && bestQuote && isBestQuote && getBetterBy(bestQuote, quotes[1], sorting, isBuyOrder);
  const worseBy =
    selectedRoute && bestQuote && !isBestQuote && getWorseBy(bestQuote, selectedRoute, sorting, isBuyOrder);

  const open = Boolean(anchorEl);
  const id = open ? 'quotes-popover' : undefined;

  let color: string | undefined = '#219653';

  if (!isBestQuote) {
    color = '#EB5757';
  } else if (
    betterBy &&
    parseFloat(
      formatCurrencyAmount((isBestQuote ? betterBy : worseBy) || BigNumber.from(0), emptyTokenWithDecimals(18), 3, 2)
    ) === 0
  ) {
    color = undefined;
  }

  return (
    <StyledContainer>
      <Grid container alignItems="center">
        {isLoading && (
          <Grid item xs={12}>
            <StyledCenteredWrapper>
              <TransactionsProgress showSimulate={isPermit2Enabled && from?.address === PROTOCOL_TOKEN_ADDRESS} />
            </StyledCenteredWrapper>
          </Grid>
        )}
        {!isLoading && selectedRoute && quotes.length > 1 && (
          <Grid item xs={12}>
            <StyledQuoteContainer>
              <StyledSwapperContainer>
                <TokenIcon isInChip size="24px" token={emptyTokenWithLogoURI(selectedRoute.swapper.logoURI)} />
                <Typography variant="h6" color="#ffffff">
                  {selectedRoute.swapper.name}
                </Typography>
              </StyledSwapperContainer>
              <StyledBetterByContainer>
                <Typography variant="h6" color={color}>
                  {formatCurrencyAmount(
                    (isBestQuote ? betterBy : worseBy) || BigNumber.from(0),
                    emptyTokenWithDecimals(18),
                    3,
                    2
                  )}
                  {sorting === SORT_MOST_PROFIT ? ' USD' : '%'}
                </Typography>
                <Typography variant="caption">
                  {isBestQuote
                    ? intl.formatMessage(getBetterByLabel(sorting, isBuyOrder, true))
                    : intl.formatMessage(getWorseByLabel(sorting, isBuyOrder, true))}
                </Typography>
              </StyledBetterByContainer>
            </StyledQuoteContainer>
          </Grid>
        )}
        {!isLoading && selectedRoute && quotes.length === 1 && (
          <Grid item xs={12}>
            <StyledQuoteContainer>
              <StyledSwapperContainer>
                <TokenIcon isInChip size="24px" token={emptyTokenWithLogoURI(selectedRoute.swapper.logoURI)} />
                <Typography variant="h6" color="#ffffff">
                  {selectedRoute.swapper.name}
                </Typography>
              </StyledSwapperContainer>
              <StyledBetterByContainer>
                <Typography variant="h6" color={color}>
                  {formatCurrencyAmount(selectedRoute.buyAmount.amount, selectedRoute.buyToken)}{' '}
                  {selectedRoute.buyToken.symbol}
                </Typography>
                <Typography variant="caption">
                  <FormattedMessage description="onlyOptionFound" defaultMessage="Only route available" />
                </Typography>
              </StyledBetterByContainer>
            </StyledQuoteContainer>
          </Grid>
        )}
        <Grid item xs={12} sm={6}>
          {selectedRoute && !isLoading && (
            <QuoteRefresher isLoading={isLoading} refreshQuotes={fetchOptions} disableRefreshQuotes={!refreshQuotes} />
          )}
        </Grid>
        <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          {selectedRoute && quotes.length > 1 && !isLoading && (
            <>
              <Popover
                anchorOrigin={{
                  vertical: 'center',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'center',
                  horizontal: 'left',
                }}
                anchorEl={anchorEl}
                id={id}
                open={!isLoading && open}
                onClose={handleClose}
                disableAutoFocus
                PaperProps={{
                  style: {
                    display: 'flex',
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    borderRadius: 0,
                    background: 'none',
                  },
                }}
              >
                <Box
                  sx={{
                    ml: '10px',
                    '&::before': {
                      backgroundColor: '#292929',
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      width: 12,
                      height: 12,
                      top: 'calc(50% - 6px)',
                      transform: 'rotate(45deg)',
                      left: 6,
                      zIndex: 99,
                    },
                  }}
                />
                <QuoteList
                  onClick={changeSelectedRoute}
                  selectedRoute={selectedRoute}
                  sorting={sorting}
                  isBuyOrder={isBuyOrder}
                  quotes={quotes}
                  bestQuote={bestQuote}
                />
              </Popover>
              <Button aria-describedby={id} variant="text" color="secondary" disabled={isLoading} onClick={handleClick}>
                <FormattedMessage description="viewOtherOptions" defaultMessage="View other options" />
              </Button>
            </>
          )}
        </Grid>
      </Grid>
    </StyledContainer>
  );
};
export default QuoteSelection;
