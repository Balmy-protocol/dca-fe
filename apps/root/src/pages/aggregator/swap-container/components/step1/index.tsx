import React from 'react';
import { Grid, Alert, Typography, colors, Button, Tooltip, SendIcon, ContainerBox } from 'ui-library';
import isUndefined from 'lodash/isUndefined';
import { SetStateCallback, SwapOption, Token } from '@types';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import { formatUnits, parseUnits } from 'viem';
import useUsdPrice from '@hooks/useUsdPrice';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import useIsPermit2Enabled from '@hooks/useIsPermit2Enabled';
import { useAppDispatch } from '@hooks/state';
import useTrackEvent from '@hooks/useTrackEvent';
import { setFromValue, setToValue } from '@state/aggregator/actions';
import QuoteData from '../quote-data';
import TransferTo from '../transfer-to';
import QuoteSimulation from '../quote-simulation';
import AdvancedSettings from '../advanced-settings';
import TokenPickerWithAmount from '@common/components/token-amount-input';
import ToggleButton from '../toggle-button';
import QuoteSelection from '../quote-selection';
import { useThemeMode } from '@state/config/hooks';
import SwapNetworkSelector from '../swap-network-selector';
import SwapButton from '../swap-button';

interface SwapFirstStepProps {
  from: Token | null;
  fromValue: string;
  to: Token | null;
  toValue: string;
  startSelectingCoin: (token: Token) => void;
  cantFund: boolean;
  balance?: bigint;
  selectedRoute: SwapOption | null;
  isBuyOrder: boolean;
  isLoadingRoute: boolean;
  transferTo: string | null;
  setShouldShowTransferModal: SetStateCallback<boolean>;
  onShowSettings: () => void;
  isApproved: boolean;
  quotes: SwapOption[];
  fetchOptions: () => void;
  refreshQuotes: boolean;
  swapOptionsError?: string;
  allowanceErrors?: string;
  handleMultiSteps: () => void;
  handleSwap: () => Promise<void>;
  handleSafeApproveAndSwap: () => Promise<void>;
}

const SwapFirstStep = ({
  from,
  to,
  fromValue,
  toValue,
  startSelectingCoin,
  cantFund,
  balance,
  selectedRoute,
  isBuyOrder,
  isLoadingRoute,
  transferTo,
  setShouldShowTransferModal,
  isApproved,
  onShowSettings,
  quotes,
  fetchOptions,
  refreshQuotes,
  swapOptionsError,
  allowanceErrors,
  handleMultiSteps,
  handleSwap,
  handleSafeApproveAndSwap,
}: SwapFirstStepProps) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();
  const themeMode = useThemeMode();
  const [transactionWillFail, setTransactionWillFail] = React.useState(false);

  let fromValueToUse =
    isBuyOrder && selectedRoute
      ? (selectedRoute?.sellToken.address === from?.address &&
          formatUnits(selectedRoute.sellAmount.amount, selectedRoute.sellToken.decimals)) ||
        '0'
      : fromValue;
  let toValueToUse = isBuyOrder
    ? toValue
    : (selectedRoute?.buyToken.address === to?.address &&
        formatUnits(BigInt(selectedRoute?.buyAmount.amount || '0'), selectedRoute?.buyToken.decimals || 18)) ||
      '0' ||
      '';

  const selectedNetwork = useSelectedNetwork();

  const isPermit2Enabled = useIsPermit2Enabled(selectedNetwork.chainId);

  const [fromFetchedPrice, isLoadingFromPrice] = useUsdPrice(
    from,
    parseUnits(fromValueToUse || '0', selectedRoute?.sellToken.decimals || from?.decimals || 18)
  );
  const [toFetchedPrice, isLoadingToPrice] = useUsdPrice(
    to,
    parseUnits(toValueToUse || '0', selectedRoute?.buyToken.decimals || to?.decimals || 18)
  );
  const fromPrice = selectedRoute?.sellAmount.amountInUSD;
  const toPrice = selectedRoute?.buyAmount.amountInUSD;

  const fromPriceToShow = fromPrice || fromFetchedPrice;
  const toPriceToShow = toPrice || toFetchedPrice;

  if (isLoadingRoute) {
    if (isBuyOrder) {
      fromValueToUse = '...';
    } else {
      toValueToUse = '...';
    }
  }

  const priceImpact =
    !!selectedRoute &&
    !!selectedRoute.buyAmount.amountInUSD &&
    !!selectedRoute.sellAmount.amountInUSD &&
    (
      Math.round(
        ((Number(selectedRoute.buyAmount.amountInUSD) - Number(selectedRoute.sellAmount.amountInUSD)) /
          Number(selectedRoute.sellAmount.amountInUSD)) *
          10000
      ) / 100
    ).toFixed(2);

  const onSetFromAmount = (newFromAmount: string) => {
    if (!from) return;
    dispatch(setFromValue({ value: newFromAmount, updateMode: true }));
    if (isBuyOrder) {
      trackEvent('Aggregator - Set sell order');
    }
  };
  const onSetToAmount = (newToAmount: string) => {
    if (!to) return;
    dispatch(setToValue({ value: newToAmount, updateMode: true }));
    if (!isBuyOrder) {
      trackEvent('Aggregator - Set buy order');
    }
  };

  return (
    <Grid container rowSpacing={8} flexDirection="column">
      <Grid item xs={12}>
        <AdvancedSettings onShowSettings={onShowSettings} />
      </Grid>
      <Typography variant="h4" fontWeight="bold" color={colors[themeMode].typography.typo1}>
        <FormattedMessage description="makeASwap" defaultMessage="Make a Swap" />
      </Typography>
      <Grid item xs={12}>
        <SwapNetworkSelector />
      </Grid>
      <Grid item xs={12}>
        <Grid item xs={12} position="relative">
          <TokenPickerWithAmount
            id="from-value"
            label={<FormattedMessage description="youPay" defaultMessage="You pay" />}
            cantFund={cantFund}
            tokenAmount={fromValueToUse}
            isLoadingRoute={isLoadingRoute}
            isLoadingPrice={isLoadingFromPrice}
            tokenPrice={fromPriceToShow}
            startSelectingCoin={startSelectingCoin}
            selectedToken={from}
            onSetTokenAmount={onSetFromAmount}
            balance={balance}
            maxBalanceBtn
          />
          <ToggleButton isLoadingRoute={isLoadingRoute} />
        </Grid>
        <Grid item xs={12} sx={{ paddingTop: '8px !important' }}>
          <TokenPickerWithAmount
            id="to-value"
            label={<FormattedMessage description="youReceive" defaultMessage="You receive" />}
            tokenAmount={toValueToUse}
            isLoadingRoute={isLoadingRoute}
            isLoadingPrice={isLoadingToPrice}
            tokenPrice={toPriceToShow}
            startSelectingCoin={startSelectingCoin}
            selectedToken={to}
            onSetTokenAmount={onSetToAmount}
            priceImpact={priceImpact}
          />
        </Grid>
      </Grid>
      {transferTo && (
        <Grid item xs={12}>
          <TransferTo transferTo={transferTo} onOpenTransferTo={() => setShouldShowTransferModal(true)} />
        </Grid>
      )}
      <Grid item xs={12}>
        <QuoteSelection
          quotes={quotes}
          isLoading={isLoadingRoute}
          bestQuote={quotes[0]}
          fetchOptions={fetchOptions}
          refreshQuotes={refreshQuotes}
          swapOptionsError={swapOptionsError}
        />
        {!isPermit2Enabled && (
          <QuoteSimulation
            route={selectedRoute}
            cantFund={cantFund}
            isApproved={isApproved}
            isLoadingRoute={isLoadingRoute}
            setTransactionWillFail={setTransactionWillFail}
            forceProviderSimulation={!!transferTo}
          />
        )}
        {selectedRoute && !isLoadingRoute && (isUndefined(fromPriceToShow) || isUndefined(toPriceToShow)) && (
          <Alert severity="warning" variant="outlined" sx={{ alignItems: 'center' }}>
            <FormattedMessage
              description="aggregatorPriceNotFound"
              defaultMessage="We couldn't calculate the price for {from}{and}{to}, which means we cannot estimate the price impact. Please be cautious and trade at your own risk."
              values={{
                from: isUndefined(fromPriceToShow) ? selectedRoute.sellToken.symbol : '',
                to: isUndefined(toPriceToShow) ? selectedRoute.buyToken.symbol : '',
                and:
                  isUndefined(fromPriceToShow) && isUndefined(toPriceToShow)
                    ? intl.formatMessage(
                        defineMessage({
                          defaultMessage: ' and ',
                          description: 'andWithSpaces',
                        })
                      )
                    : '',
              }}
            />
          </Alert>
        )}
      </Grid>
      {selectedRoute && (
        <Grid item xs={12}>
          <QuoteData quote={(!isLoadingRoute && selectedRoute) || null} isBuyOrder={isBuyOrder} to={to} />
        </Grid>
      )}
      <Grid item xs={12}>
        <ContainerBox gap={2} fullWidth justifyContent="center">
          <SwapButton
            cantFund={cantFund}
            fromValue={fromValueToUse}
            isApproved={isApproved}
            allowanceErrors={allowanceErrors}
            balance={balance}
            isLoadingRoute={isLoadingRoute}
            transactionWillFail={transactionWillFail}
            handleMultiSteps={handleMultiSteps}
            handleSwap={handleSwap}
            handleSafeApproveAndSwap={handleSafeApproveAndSwap}
          />
          {!transferTo && (
            <Button variant="contained" color="secondary" size="small" onClick={() => setShouldShowTransferModal(true)}>
              <Tooltip
                title={
                  <FormattedMessage
                    description="tranferToTooltip"
                    defaultMessage="Swap and transfer to another address"
                  />
                }
                arrow
                placement="top"
              >
                <SendIcon fontSize="small" />
              </Tooltip>
            </Button>
          )}
        </ContainerBox>
      </Grid>
    </Grid>
  );
};

export default SwapFirstStep;
