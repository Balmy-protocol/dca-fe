import React from 'react';
import { Grid, Alert, Button, ContainerBox, Typography, colors, TokenPickerAmountUsdInput } from 'ui-library';
import isUndefined from 'lodash/isUndefined';
import { AmountsOfToken, SetStateCallback, SwapOption, Token } from '@types';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import { formatUnits, parseUnits } from 'viem';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import useIsPermit2Enabled from '@hooks/useIsPermit2Enabled';
import { useAppDispatch } from '@hooks/state';
import useAnalytics from '@hooks/useAnalytics';
import { setFromValue, setToValue } from '@state/aggregator/actions';
import QuoteData from '../quote-data';
import TransferTo from '../transfer-to';
import QuoteSimulation from '../quote-simulation';
import AdvancedSettings from '../advanced-settings';
import ToggleButton from '../toggle-button';
import QuoteSelection from '../quote-selection';
import SwapNetworkSelector from '../swap-network-selector';
import SwapButton from '../swap-button';
import { emptyTokenWithAddress, parseNumberUsdPriceToBigInt, parseUsdPrice } from '@common/utils/currency';
import { ContactListActiveModal } from '@common/components/contact-modal';
import FormWalletSelector from '@common/components/form-wallet-selector';
import TokenIcon from '@common/components/token-icon';
import useRawUsdPrice from '@hooks/useUsdRawPrice';
import { usePortfolioPrices } from '@state/balances/hooks';
import { compact } from 'lodash';
interface SwapFirstStepProps {
  from: Token | null;
  fromValue: string;
  to: Token | null;
  toValue: string;
  startSelectingCoin: (token: Token, selection: 'from' | 'to') => void;
  cantFund: boolean;
  balanceFrom?: AmountsOfToken;
  isLoadingFromBalance?: boolean;
  balanceTo?: AmountsOfToken;
  isLoadingToBalance?: boolean;
  selectedRoute: SwapOption | null;
  isBuyOrder: boolean;
  isLoadingRoute: boolean;
  transferTo: string | null;
  setActiveContactModal: SetStateCallback<ContactListActiveModal>;
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
  totalQuotes: number;
  missingQuotes: string[];
}

const SwapFirstStep = ({
  from,
  to,
  fromValue,
  toValue,
  startSelectingCoin,
  cantFund,
  balanceFrom,
  balanceTo,
  isLoadingToBalance,
  isLoadingFromBalance,
  selectedRoute,
  isBuyOrder,
  isLoadingRoute,
  transferTo,
  setActiveContactModal,
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
  totalQuotes,
  missingQuotes,
}: SwapFirstStepProps) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { trackEvent } = useAnalytics();
  const [transactionWillFail, setTransactionWillFail] = React.useState(false);
  const prices = usePortfolioPrices(compact([from]));
  const [toPrice] = useRawUsdPrice(to);
  const fromPrice = from ? parseNumberUsdPriceToBigInt(prices[from?.address]?.price) : undefined;

  let fromValueToUse =
    isBuyOrder && selectedRoute
      ? (selectedRoute?.sellToken.address === from?.address &&
          formatUnits(selectedRoute.sellAmount.amount, selectedRoute.sellToken.decimals)) ||
        '0.0'
      : fromValue;
  let toValueToUse = isBuyOrder
    ? toValue
    : (selectedRoute &&
        selectedRoute?.buyToken.address === to?.address &&
        formatUnits(selectedRoute.buyAmount.amount, selectedRoute.buyToken.decimals || 18)) ||
      '';

  const fromUsdValueToUse =
    selectedRoute?.sellAmount.amountInUSD ||
    (fromValueToUse &&
      fromValueToUse !== '' &&
      from &&
      fromPrice &&
      parseUsdPrice(from, parseUnits(fromValueToUse, from.decimals), fromPrice)) ||
    undefined;
  const toUsdValueToUse =
    selectedRoute?.buyAmount.amountInUSD ||
    (toValueToUse &&
      toValueToUse !== '' &&
      to &&
      toPrice &&
      parseUsdPrice(to, parseUnits(toValueToUse, to.decimals), toPrice)) ||
    undefined;

  const selectedNetwork = useSelectedNetwork();

  const isPermit2Enabled = useIsPermit2Enabled(selectedNetwork.chainId);

  if (isLoadingRoute) {
    if (isBuyOrder) {
      fromValueToUse = '...';
    } else {
      toValueToUse = '...';
    }
  }

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

  const fromAmount: AmountsOfToken = {
    // Not needed for now but required for type
    amount: 0n,
    amountInUnits: fromValueToUse,
    amountInUSD: fromUsdValueToUse?.toString(),
  };

  const toAmount: AmountsOfToken = {
    // Not needed for now but required for type
    amount: 0n,
    amountInUnits: toValueToUse,
    amountInUSD: toUsdValueToUse?.toString(),
  };

  const priceImpact =
    (!!selectedRoute &&
      !!fromUsdValueToUse &&
      !!toUsdValueToUse &&
      (
        Math.round(((Number(toUsdValueToUse) - Number(fromUsdValueToUse)) / Number(fromUsdValueToUse)) * 10000) / 100
      ).toFixed(2)) ||
    undefined;

  const fromTokenWithIcon = React.useMemo(
    () => (from ? { ...from, icon: <TokenIcon token={from} size={5} /> } : undefined),
    [from]
  );
  const toTokenWithIcon = React.useMemo(
    () => (to ? { ...to, icon: <TokenIcon token={to} size={5} /> } : undefined),
    [to]
  );

  return (
    <Grid container rowSpacing={6} flexDirection="column">
      <AdvancedSettings onShowSettings={onShowSettings} />
      {transferTo && (
        <Grid item xs={12}>
          <TransferTo
            transferTo={transferTo}
            onOpenTransferTo={() => setActiveContactModal(ContactListActiveModal.CONTACT_LIST)}
            showControls
          />
        </Grid>
      )}
      <Grid item xs={12}>
        <ContainerBox flexDirection="column" gap={3}>
          <ContainerBox gap={1} flexDirection="column">
            <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].typography.typo4}>
              <FormattedMessage description="aggregator.form.wallet-selector.title" defaultMessage="Wallet" />
            </Typography>
            <FormWalletSelector />
          </ContainerBox>
          <ContainerBox gap={1} flexDirection="column">
            <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].typography.typo4}>
              <FormattedMessage description="aggregator.form.network-selector.title" defaultMessage="Network" />
            </Typography>
            <SwapNetworkSelector />
          </ContainerBox>
        </ContainerBox>
      </Grid>
      <Grid item xs={12}>
        <Grid item xs={12} position="relative">
          <TokenPickerAmountUsdInput
            id="from-value"
            label={<FormattedMessage description="youPay" defaultMessage="You pay" />}
            cantFund={cantFund}
            value={fromValueToUse}
            disabled={isLoadingRoute}
            isLoadingBalance={isLoadingFromBalance}
            startSelectingCoin={(token) => startSelectingCoin(token || emptyTokenWithAddress('from'), 'from')}
            token={fromTokenWithIcon}
            onChange={onSetFromAmount}
            balance={balanceFrom}
            maxBalanceBtn
            tokenPrice={fromPrice}
          />
          <ToggleButton isLoadingRoute={isLoadingRoute} />
        </Grid>
        <Grid item xs={12} sx={{ paddingTop: '8px !important' }}>
          <TokenPickerAmountUsdInput
            id="to-value"
            label={<FormattedMessage description="youReceive" defaultMessage="You receive" />}
            value={toValueToUse}
            disabled={isLoadingRoute}
            isLoadingBalance={isLoadingToBalance}
            startSelectingCoin={(token) => startSelectingCoin(token || emptyTokenWithAddress('to'), 'to')}
            balance={balanceTo}
            token={toTokenWithIcon}
            onChange={onSetToAmount}
            priceImpact={priceImpact}
            tokenPrice={toPrice}
          />
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <QuoteSelection
          quotes={quotes}
          isLoading={isLoadingRoute}
          bestQuote={quotes[0]}
          fetchOptions={fetchOptions}
          refreshQuotes={refreshQuotes}
          swapOptionsError={swapOptionsError}
          missingQuotes={missingQuotes}
          totalQuotes={totalQuotes}
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
        {selectedRoute &&
          !isLoadingRoute &&
          (isUndefined(fromAmount.amountInUSD) || isUndefined(toAmount.amountInUSD)) && (
            <Alert
              severity="warning"
              variant="standard"
              sx={{ alignItems: 'center', marginTop: ({ spacing }) => spacing(6) }}
            >
              <FormattedMessage
                description="aggregatorPriceNotFound"
                defaultMessage="We couldn't calculate the price for {from}{and}{to}, which means we cannot estimate the price impact. Please be cautious and trade at your own risk."
                values={{
                  from: isUndefined(fromAmount.amountInUSD) ? from?.symbol || selectedRoute.sellToken.symbol : '',
                  to: isUndefined(toAmount.amountInUSD) ? to?.symbol || selectedRoute.buyToken.symbol : '',
                  and:
                    isUndefined(fromAmount.amountInUSD) && isUndefined(toAmount.amountInUSD)
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
      <Grid item xs={12} marginTop={({ spacing }) => spacing(2)}>
        <ContainerBox flexDirection="column" gap={3} fullWidth alignItems="center">
          <SwapButton
            cantFund={cantFund}
            fromValue={fromValueToUse}
            isApproved={isApproved}
            allowanceErrors={allowanceErrors}
            balance={balanceFrom}
            isLoadingRoute={isLoadingRoute}
            transactionWillFail={transactionWillFail}
            handleMultiSteps={handleMultiSteps}
            handleSwap={handleSwap}
            handleSafeApproveAndSwap={handleSafeApproveAndSwap}
          />
          {!transferTo && (
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => setActiveContactModal(ContactListActiveModal.CONTACT_LIST)}
              disabled={isLoadingRoute}
            >
              <FormattedMessage description="swapAndTransferBtn" defaultMessage="Swap and transfer" />
            </Button>
          )}
        </ContainerBox>
      </Grid>
    </Grid>
  );
};

export default SwapFirstStep;
