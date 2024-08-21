import * as React from 'react';
import {
  Typography,
  ErrorOutlineIcon,
  Button,
  colors,
  ContainerBox,
  Skeleton,
  Tooltip,
  InfoCircleIcon,
} from 'ui-library';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { SwapOption } from '@types';
import { useAggregatorState } from '@state/aggregator/hooks';
import { emptyTokenWithDecimals, formatCurrencyAmount } from '@common/utils/currency';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import { getBetterBy, getBetterByLabel, getWorseBy, getWorseByLabel } from '@common/utils/quotes';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useIsPermit2Enabled from '@hooks/useIsPermit2Enabled';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import QuoteRefresher from '../quote-refresher';
import { useThemeMode } from '@state/config/hooks';
import { formatSwapDiffLabel } from '@common/utils/swap';
import QuotePicker from '../quote-picker';

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

const StyledDiffCaptionContainer = styled(ContainerBox).attrs({
  fullWidth: true,
  flexDirection: 'column',
})`
  ${({ theme: { palette, spacing } }) => `
  padding-bottom: ${spacing(2)};
  border-bottom: 1px solid ${colors[palette.mode].border.border2};
`}
`;

interface SwapQuotesProps {
  quotes: SwapOption[];
  isLoading: boolean;
  fetchOptions: () => void;
  refreshQuotes: boolean;
  bestQuote?: SwapOption | null;
  swapOptionsError?: string;
  missingQuotes: string[];
  totalQuotes: number;
}

const QuoteSelection = ({
  quotes,
  isLoading,
  fetchOptions,
  refreshQuotes,
  bestQuote,
  swapOptionsError,
  missingQuotes,
  totalQuotes,
}: SwapQuotesProps) => {
  const { isBuyOrder, selectedRoute, from } = useAggregatorState();
  const { sorting } = useAggregatorSettingsState();
  const currentNetwork = useSelectedNetwork();
  const isPermit2Enabled = useIsPermit2Enabled(currentNetwork.chainId);
  const intl = useIntl();
  const mode = useThemeMode();

  if (!quotes.length && !isLoading && !!swapOptionsError) {
    return (
      <StyledQuoteSelectionContainer>
        <Typography variant="h6" textAlign="left" fontWeight={700}>
          <FormattedMessage description="All routes failed" defaultMessage="We could not fetch a route for your swap" />
        </Typography>
        <ContainerBox flexDirection="column" alignItems="center" gap={3}>
          <ErrorOutlineIcon fontSize="large" />

          <Button variant="contained" onClick={fetchOptions}>
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
    color = colors[mode].typography.typo5;
  } else if (!isBestQuote) {
    color = colors[mode].semantic.error.darker;
  } else if (
    betterBy &&
    parseFloat(
      formatCurrencyAmount({
        amount: (isBestQuote ? betterBy : worseBy) || 0n,
        token: emptyTokenWithDecimals(18),
        sigFigs: 3,
        maxDecimals: 2,
      })
    ) === 0
  ) {
    color = undefined;
  }

  let diffLabel = formatSwapDiffLabel('0.00', sorting);
  let diffCaption = intl.formatMessage(
    defineMessage({ description: 'quoteCaptionDefault', defaultMessage: 'Best rate. Better than the next' })
  );

  if (!isLoading && selectedRoute && quotes.length > 1) {
    diffLabel = formatSwapDiffLabel(
      formatCurrencyAmount({
        amount: (isBestQuote ? betterBy : worseBy) || 0n,
        token: emptyTokenWithDecimals(18),
        sigFigs: 3,
        maxDecimals: 2,
        intl,
      }),
      sorting,
      isBestQuote
    );
    diffCaption = isBestQuote
      ? intl.formatMessage(getBetterByLabel(sorting, isBuyOrder, true))
      : intl.formatMessage(getWorseByLabel(sorting, isBuyOrder, true));
  } else if (!isLoading && selectedRoute && quotes.length === 1) {
    diffLabel = `${formatCurrencyAmount({
      amount: selectedRoute.buyAmount.amount,
      token: selectedRoute.buyToken,
      intl,
    })} ${selectedRoute.buyToken.symbol}`;

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
          total: totalQuotes,
          current: totalQuotes - missingQuotes.length,
        }}
      />
    ) : (
      <FormattedMessage
        description="aggregator.quote-selection.loading-quotes"
        defaultMessage="Fetching the best route for you ({current}/{total})"
        values={{
          total: totalQuotes,
          current: totalQuotes - missingQuotes.length,
        }}
      />
    );

  console.log('updating quote selection', selectedRoute);
  return (
    <StyledQuoteSelectionContainer $isSelected={!!selectedRoute && !isLoading}>
      <Typography
        variant="bodySmallBold"
        color={!!selectedRoute && !isLoading ? colors[mode].typography.typo2 : colors[mode].typography.typo3}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: ({ spacing }) => spacing(1) }}
      >
        {isLoading ? (
          loadingTitle
        ) : !selectedRoute ? (
          <>
            <FormattedMessage description="swapReadyToFind" defaultMessage="Ready to find the best Swap" />
            <Tooltip
              title={
                <FormattedMessage
                  description="swapReadyToFindInfoTooltip"
                  defaultMessage="Once you've selected your tokens and amount, we'll instantly query top DEX aggregators to find you the best swap price available."
                />
              }
              placement="top"
              arrow
            >
              <ContainerBox>
                <InfoCircleIcon size="inherit" />
              </ContainerBox>
            </Tooltip>
          </>
        ) : (
          <FormattedMessage description="swapBestSourceSelected" defaultMessage="Best source selected for your Swap" />
        )}
      </Typography>
      <ContainerBox justifyContent="space-between" alignItems="start" fullWidth>
        <ContainerBox flexDirection="column" gap={3} alignItems="start">
          <QuotePicker isBuyOrder={isBuyOrder} isLoading={isLoading} quotes={quotes} bestQuote={bestQuote} />
          <QuoteRefresher
            isLoading={isLoading}
            refreshQuotes={fetchOptions}
            disableRefreshQuotes={!refreshQuotes || !selectedRoute}
          />
        </ContainerBox>
        <ContainerBox flexDirection="column" gap={3}>
          <StyledDiffCaptionContainer>
            <Typography
              variant={selectedRoute && quotes.length > 1 && !isLoading ? 'h5Bold' : 'h4Bold'}
              color={color}
              textAlign="right"
            >
              {isLoading ? <Skeleton variant="text" animation="wave" /> : diffLabel}
            </Typography>
          </StyledDiffCaptionContainer>
          <Typography variant="bodySmallLabel">{diffCaption}</Typography>
        </ContainerBox>
      </ContainerBox>
    </StyledQuoteSelectionContainer>
  );
};
export default QuoteSelection;
