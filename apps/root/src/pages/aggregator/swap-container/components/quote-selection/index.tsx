import * as React from 'react';
import {
  Popover,
  Typography,
  ErrorOutlineIcon,
  Button,
  colors,
  baseColors,
  ContainerBox,
  IconButton,
  KeyboardArrowDownIcon,
  Skeleton,
} from 'ui-library';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { SwapOption } from '@types';
import { useAggregatorState } from '@state/aggregator/hooks';
import TokenIcon from '@common/components/token-icon';
import { emptyTokenWithDecimals, emptyTokenWithLogoURI, formatCurrencyAmount } from '@common/utils/currency';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import { getBetterBy, getBetterByLabel, getWorseBy, getWorseByLabel } from '@common/utils/quotes';
import { setSelectedRoute } from '@state/aggregator/actions';
import { useAppDispatch } from '@state/hooks';
import useTrackEvent from '@hooks/useTrackEvent';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useIsPermit2Enabled from '@hooks/useIsPermit2Enabled';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import QuoteRefresher from '../quote-refresher';
import QuoteList from '../quote-list';
import { useThemeMode } from '@state/config/hooks';
import { formatSwapDiffLabel } from '@common/utils/swap';
import useSimulationTimer from '@hooks/useSimulationTimer';

const StyledQuoteSelectionContainer = styled(ContainerBox).attrs({ flexDirection: 'column', gap: 6, fullWidth: true })<{
  $isSelected?: boolean;
}>`
  ${({ theme: { palette, spacing }, $isSelected }) => `
  padding: ${spacing(5)};
  border-radius: ${spacing(4)};
  border: 1px solid ${colors[palette.mode].border.border1};
  transition: background 300ms;
  background: ${$isSelected ? colors[palette.mode].background.secondary : colors[palette.mode].background.quartery};
  `}
`;

const StyledSwapperContainer = styled(ContainerBox).attrs({ alignItems: 'center', gap: 2 })<{ $isSelected?: boolean }>`
  ${({ theme: { spacing, palette }, $isSelected }) => `
  padding: ${spacing(2)};
  border: 1px solid ${colors[palette.mode].border.border1};
  border-radius: ${spacing(15)};
  transition: box-shadow 300ms;
  ${$isSelected ? `box-shadow: ${baseColors.dropShadow.dropShadow100}` : ''};
  `}
`;

const StyledSwapperText = styled(Typography).attrs({ variant: 'body', fontWeight: 600, noWrap: true })<{
  $isSelected?: boolean;
}>`
  ${({ theme: { palette }, $isSelected }) => !$isSelected && `color: ${colors[palette.mode].typography.typo4};`}
`;

const StyledDiffCaptionContainer = styled(ContainerBox).attrs({
  fullWidth: true,
  flexDirection: 'column',
})`
  ${({ theme: { palette, spacing } }) => `
  padding-bottom: ${spacing(2)};
  border-bottom: 1px solid ${colors[palette.mode].border.border2};
`}
`;

const TOTAL_SIMULATIONS = 9;

interface SwapQuotesProps {
  quotes: SwapOption[];
  isLoading: boolean;
  fetchOptions: () => void;
  refreshQuotes: boolean;
  bestQuote?: SwapOption | null;
  swapOptionsError?: string;
}

interface QuoteListButtonProps {
  quotes: SwapOption[];
  isLoading: boolean;
  bestQuote?: SwapOption | null;
}

const QuoteListButton = ({ quotes, isLoading, bestQuote }: QuoteListButtonProps) => {
  const { isBuyOrder, selectedRoute } = useAggregatorState();
  const { sorting } = useAggregatorSettingsState();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();
  const mode = useThemeMode();

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
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'quotes-popover' : undefined;

  return (
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
        slotProps={{
          paper: {
            style: {
              boxShadow: baseColors.dropShadow.dropShadow300,
              background: 'none',
            },
          },
        }}
      >
        <QuoteList
          onClick={changeSelectedRoute}
          selectedRoute={selectedRoute}
          sorting={sorting}
          isBuyOrder={isBuyOrder}
          quotes={quotes}
          bestQuote={bestQuote}
        />
      </Popover>
      <IconButton aria-describedby={id} onClick={handleClick}>
        <KeyboardArrowDownIcon sx={{ color: colors[mode].typography.typo2 }} />
      </IconButton>
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
  const simulationsTimer = useSimulationTimer({
    simulations: TOTAL_SIMULATIONS,
    simulationInProgress: isPermit2Enabled && from?.address === PROTOCOL_TOKEN_ADDRESS && isLoading,
  });
  const intl = useIntl();
  const mode = useThemeMode();

  if (!quotes.length && !isLoading && !!swapOptionsError) {
    return (
      <StyledQuoteSelectionContainer>
        <Typography variant="h6" textAlign="left" fontWeight={700} color={colors[mode].typography.typo2}>
          <FormattedMessage description="All routes failed" defaultMessage="We could not fetch a route for your swap" />
        </Typography>
        <ContainerBox flexDirection="column" alignItems="center" gap={3}>
          <ErrorOutlineIcon fontSize="large" />

          <Button variant="contained" color="secondary" onClick={fetchOptions}>
            <FormattedMessage description="All routes failed action" defaultMessage="Try to get a route again" />
          </Button>
        </ContainerBox>
      </StyledQuoteSelectionContainer>
    );
  }

  const isBestQuote = bestQuote?.swapper.id === selectedRoute?.swapper.id;

  const betterBy = selectedRoute && bestQuote && isBestQuote && getBetterBy(bestQuote, quotes[1], sorting, isBuyOrder);
  const worseBy =
    selectedRoute && bestQuote && !isBestQuote && getWorseBy(bestQuote, selectedRoute, sorting, isBuyOrder);

  let color: string | undefined = colors[mode].semantic.success.darker;

  if (!selectedRoute) {
    color = colors[mode].typography.typo4;
  } else if (!isBestQuote) {
    color = colors[mode].semantic.error.darker;
  } else if (
    betterBy &&
    parseFloat(formatCurrencyAmount((isBestQuote ? betterBy : worseBy) || 0n, emptyTokenWithDecimals(18), 3, 2)) === 0
  ) {
    color = undefined;
  }

  let diffLabel = formatSwapDiffLabel('0.00', sorting);
  let diffCaption = intl.formatMessage(
    defineMessage({ description: 'quoteCaptionDefault', defaultMessage: 'Best rate. Better than the next' })
  );

  if (!isLoading && selectedRoute && quotes.length > 1) {
    diffLabel = formatSwapDiffLabel(
      formatCurrencyAmount((isBestQuote ? betterBy : worseBy) || 0n, emptyTokenWithDecimals(18), 3, 2),
      sorting
    );
    diffCaption = isBestQuote
      ? intl.formatMessage(getBetterByLabel(sorting, isBuyOrder, true))
      : intl.formatMessage(getWorseByLabel(sorting, isBuyOrder, true));
  } else if (!isLoading && selectedRoute && quotes.length === 1) {
    diffLabel = `${formatCurrencyAmount(selectedRoute.buyAmount.amount, selectedRoute.buyToken)} ${
      selectedRoute.buyToken.symbol
    }`;

    diffCaption = intl.formatMessage(
      defineMessage({
        description: 'onlyOptionFound',
        defaultMessage: 'Only route available',
      })
    );
  }

  const loadingTitle =
    isPermit2Enabled && from?.address === PROTOCOL_TOKEN_ADDRESS ? (
      <FormattedMessage
        description="quoteSelectionSimulatingQuotes"
        defaultMessage="Simulating transactions ({current}/{total})"
        values={{
          total: TOTAL_SIMULATIONS,
          current: simulationsTimer,
        }}
      />
    ) : (
      <FormattedMessage description="loadingBestRoute" defaultMessage="Fetching the best route for you" />
    );

  return (
    <StyledQuoteSelectionContainer $isSelected={!!selectedRoute && !isLoading}>
      <Typography
        variant="h6"
        color={!!selectedRoute && !isLoading ? colors[mode].typography.typo2 : colors[mode].typography.typo3}
        fontWeight={700}
      >
        {!selectedRoute ? (
          <FormattedMessage description="swapReadyToFind" defaultMessage="Ready to find the best Swap" />
        ) : isLoading ? (
          loadingTitle
        ) : (
          <FormattedMessage description="swapBestSourceSelected" defaultMessage="Best source selected for your Swap" />
        )}
      </Typography>
      {
        <ContainerBox justifyContent="space-between" alignItems="start" fullWidth>
          <ContainerBox flexDirection="column" gap={3} alignItems="start">
            <StyledSwapperContainer $isSelected={!!selectedRoute && !isLoading}>
              <TokenIcon
                isInChip
                token={!isLoading ? emptyTokenWithLogoURI(selectedRoute?.swapper.logoURI || '') : undefined}
              />
              <StyledSwapperText $isSelected={!!selectedRoute}>
                {isLoading ? (
                  <Skeleton variant="text" animation="wave" width={100} />
                ) : (
                  selectedRoute?.swapper.name || (
                    <FormattedMessage description="swapSource" defaultMessage="Swap Source" />
                  )
                )}
              </StyledSwapperText>
              {quotes.length > 1 && !isLoading && (
                <QuoteListButton isLoading={isLoading} quotes={quotes} bestQuote={bestQuote} />
              )}
            </StyledSwapperContainer>
            <QuoteRefresher
              isLoading={isLoading}
              refreshQuotes={fetchOptions}
              disableRefreshQuotes={!refreshQuotes || !selectedRoute}
            />
          </ContainerBox>
          <ContainerBox flexDirection="column" gap={3}>
            <StyledDiffCaptionContainer>
              <Typography variant="h4" color={color} fontWeight={600} textAlign="right">
                {isLoading ? <Skeleton variant="text" animation="wave" /> : diffLabel}
              </Typography>
            </StyledDiffCaptionContainer>
            <Typography variant="bodySmall">{diffCaption}</Typography>
          </ContainerBox>
        </ContainerBox>
      }
    </StyledQuoteSelectionContainer>
  );
};
export default QuoteSelection;
