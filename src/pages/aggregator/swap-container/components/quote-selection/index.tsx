import Typography from '@mui/material/Typography';
import Button from '@common/components/button';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { SwapOption } from '@types';
import { useAggregatorState } from '@state/aggregator/hooks';
import TokenIcon from '@common/components/token-icon';
import { emptyTokenWithDecimals, emptyTokenWithLogoURI, formatCurrencyAmount } from '@common/utils/currency';
import Grid from '@mui/material/Grid';
import { BigNumber } from 'ethers';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import { getBetterBy, getBetterByLabel, getWorseBy, getWorseByLabel } from '@common/utils/quotes';
import Box from '@mui/material/Box';
import { setSelectedRoute } from '@state/aggregator/actions';
import { useAppDispatch } from '@state/hooks';
import useTrackEvent from '@hooks/useTrackEvent';
import Popover from '@mui/material/Popover';
import QuoteRefresher from '../quote-refresher';
import QuoteSorter from '../quote-sorter';
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

const QuoteSelection = ({
  quotes,
  isLoading,
  fetchOptions,
  refreshQuotes,
  bestQuote,
  swapOptionsError,
}: SwapQuotesProps) => {
  const { isBuyOrder, selectedRoute } = useAggregatorState();
  const { sorting } = useAggregatorSettingsState();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();

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

  return (
    <StyledContainer>
      <Grid container alignItems="center">
        <Grid item xs={12}>
          <QuoteSorter isLoading={isLoading} isBuyOrder={isBuyOrder} />
        </Grid>
        {isLoading && (
          <Grid item xs={12}>
            <StyledCenteredWrapper>
              <CenteredLoadingIndicator size={40} noFlex />
              <FormattedMessage description="loadingBestRoute" defaultMessage="Fetching the best route for you" />
            </StyledCenteredWrapper>
          </Grid>
        )}
        {!isLoading && selectedRoute && (
          <Grid item xs={12}>
            <StyledQuoteContainer>
              <StyledSwapperContainer>
                <TokenIcon isInChip size="24px" token={emptyTokenWithLogoURI(selectedRoute.swapper.logoURI)} />
                <Typography variant="h6" color="#ffffff">
                  {selectedRoute.swapper.name}
                </Typography>
              </StyledSwapperContainer>
              <StyledBetterByContainer>
                <Typography variant="h6" color={isBestQuote ? '#219653' : '#EB5757'}>
                  {formatCurrencyAmount(
                    (isBestQuote ? betterBy : worseBy) || BigNumber.from(0),
                    emptyTokenWithDecimals(18),
                    3,
                    2
                  )}
                  %
                </Typography>
                <Typography variant="caption">
                  {isBestQuote ? getBetterByLabel(sorting, isBuyOrder) : getWorseByLabel(sorting, isBuyOrder, true)}
                </Typography>
              </StyledBetterByContainer>
            </StyledQuoteContainer>
          </Grid>
        )}
        <Grid item xs={12} sm={6}>
          {selectedRoute && (
            <QuoteRefresher isLoading={isLoading} refreshQuotes={fetchOptions} disableRefreshQuotes={!refreshQuotes} />
          )}
        </Grid>
        <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          {selectedRoute && (
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
                open={open}
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
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      width: 12,
                      height: 12,
                      top: 'calc(50% - 6px)',
                      transform: 'rotate(45deg)',
                      left: 6,
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
