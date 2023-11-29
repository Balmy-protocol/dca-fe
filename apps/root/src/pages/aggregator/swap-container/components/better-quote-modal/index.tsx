import React from 'react';
import styled from 'styled-components';
import Modal from '@common/components/modal';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAppDispatch } from '@state/hooks';
import { setSelectedRoute } from '@state/aggregator/actions';
import useTrackEvent from '@hooks/useTrackEvent';
import TokenIcon from '@common/components/token-icon';
import { emptyTokenWithLogoURI, formatCurrencyAmount, emptyTokenWithDecimals } from '@common/utils/currency';
import { getBetterBy, getBetterByLabel, getQuoteMetric } from '@common/utils/quotes';
import { BigNumber } from 'ethers';
import { BlowfishResponse, StateChangeKind, SwapOption, SwapOptionWithFailure } from '@types';
import { Typography, EastIcon } from 'ui-library';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import { useAggregatorState } from '@state/aggregator/hooks';
import { getProtocolToken } from '@common/mocks/tokens';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { SORT_MOST_RETURN } from '@constants/aggregator';

const StyledBetterQuoteContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  flex: 1;
  gap: 10px;
`;

const StyledQuoteContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background: rgba(216, 216, 216, 0.1);
  box-shadow: inset 1px 1px 0px rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  gap: 15px;
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

const StyledComparisonContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: stretch;
`;
interface BetterQuoteModalProps {
  selectedRoute: Nullable<SwapOptionWithFailure>;
  betterQuote: Nullable<SwapOption>;
  open: boolean;
  onCancel: () => void;
  onGoBack: () => void;
  onSelectBetterQuote: (response: BlowfishResponse) => void;
}

const BetterQuoteModal = ({
  selectedRoute,
  betterQuote,
  open,
  onCancel,
  onSelectBetterQuote,
  onGoBack,
}: BetterQuoteModalProps) => {
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();
  const { sorting } = useAggregatorSettingsState();
  const { isBuyOrder } = useAggregatorState();
  const selectedNetwork = useSelectedNetwork();
  const intl = useIntl();

  const handleSelectBetterQuote = () => {
    if (!betterQuote) {
      return;
    }
    onCancel();
    dispatch(setSelectedRoute(betterQuote));
    trackEvent('Aggregator - Change better found quote', {
      originalSource: selectedRoute?.swapper.name,
      betterSource: betterQuote.swapper.name,
    });
    onSelectBetterQuote({
      action: 'NONE',
      warnings: [],
      simulationResults: {
        expectedStateChanges: [
          {
            humanReadableDiff: intl.formatMessage(
              { description: 'quoteSimulationSell', defaultMessage: 'Sell {amount} {token}' },
              { amount: betterQuote.sellAmount.amountInUnits, token: betterQuote.sellToken.symbol }
            ),
            rawInfo: {
              kind: StateChangeKind.ERC20_TRANSFER,
              data: { amount: { before: '1', after: '0' }, asset: betterQuote.sellToken },
            },
          },
          {
            humanReadableDiff: intl.formatMessage(
              { description: 'quoteSimulationBuy', defaultMessage: 'Buy {amount} {token} on {target}' },
              {
                amount: betterQuote.buyAmount.amountInUnits,
                token: betterQuote.buyToken.symbol,
                target: betterQuote.swapper.name,
              }
            ),
            rawInfo: {
              kind: StateChangeKind.ERC20_TRANSFER,
              data: { amount: { before: '0', after: '1' }, asset: betterQuote.buyToken },
            },
          },
        ],
      },
    });
  };

  const handleOnClose = () => {
    onCancel();

    if (!selectedRoute || selectedRoute.willFail) {
      onCancel();
      onGoBack();
      trackEvent('Aggregator - Quote failed go back', {
        failedSource: betterQuote?.swapper.name,
      });

      return;
    }

    if (!betterQuote) {
      return;
    }

    trackEvent('Aggregator - Dont change better found quote', {
      originalSource: selectedRoute.swapper.name,
      betterSource: betterQuote.swapper.name,
    });
    onSelectBetterQuote({
      action: 'NONE',
      warnings: [],
      simulationResults: {
        expectedStateChanges: [
          {
            humanReadableDiff: intl.formatMessage(
              { description: 'quoteSimulationSell', defaultMessage: 'Sell {amount} {token}' },
              { amount: selectedRoute.sellAmount.amountInUnits, token: selectedRoute.sellToken.symbol }
            ),
            rawInfo: {
              kind: StateChangeKind.ERC20_TRANSFER,
              data: { amount: { before: '1', after: '0' }, asset: selectedRoute.sellToken },
            },
          },
          {
            humanReadableDiff: intl.formatMessage(
              { description: 'quoteSimulationBuy', defaultMessage: 'Buy {amount} {token} on {target}' },
              {
                amount: selectedRoute.buyAmount.amountInUnits,
                token: selectedRoute.buyToken.symbol,
                target: selectedRoute.swapper.name,
              }
            ),
            rawInfo: {
              kind: StateChangeKind.ERC20_TRANSFER,
              data: { amount: { before: '0', after: '1' }, asset: selectedRoute.buyToken },
            },
          },
        ],
      },
    });
  };

  const betterBy =
    (selectedRoute && betterQuote && getBetterBy(betterQuote, selectedRoute, sorting, isBuyOrder)) || BigNumber.from(0);
  const betterMetric = betterQuote && getQuoteMetric(betterQuote, isBuyOrder);
  const worseMetric = selectedRoute && getQuoteMetric(selectedRoute, isBuyOrder);

  const protocolToken = getProtocolToken(selectedNetwork.chainId);

  return (
    <Modal
      open={open}
      maxWidth="sm"
      title={
        selectedRoute?.willFail ? (
          <FormattedMessage description="failedQuote title" defaultMessage="The quote you had selected will fail" />
        ) : (
          <FormattedMessage description="betterQuote title" defaultMessage="We found a better quote for you" />
        )
      }
      actions={[
        {
          label: selectedRoute?.willFail ? (
            <FormattedMessage description="failedQuote reject action" defaultMessage="No, search again" />
          ) : (
            <FormattedMessage
              description="betterQuote reject action"
              defaultMessage="No, use {swapper}"
              values={{ swapper: selectedRoute?.swapper.name || '' }}
            />
          ),
          color: 'default',
          variant: 'outlined',
          onClick: handleOnClose,
        },
        {
          label: (
            <FormattedMessage
              description="failedQuote approve action"
              defaultMessage="Yes, use {swapper}"
              values={{ swapper: betterQuote?.swapper.name || '' }}
            />
          ),
          color: 'secondary',
          variant: 'contained',
          onClick: handleSelectBetterQuote,
        },
      ]}
    >
      <StyledBetterQuoteContainer>
        <Typography variant="body">
          {selectedRoute?.willFail ? (
            <FormattedMessage
              description="failedQuote selectBetterQuote"
              defaultMessage="After simulating quotes, we found that {fromTarget} would fail if executed. {toTarget} is currently offering the best successful results. Would you like to use it?"
              values={{ fromTarget: selectedRoute.swapper.name, toTarget: betterQuote?.swapper.name }}
            />
          ) : (
            <FormattedMessage
              description="betterQuote selectBetterQuote"
              defaultMessage="After simulating quotes, we found that {toTarget} would be better based on the chosen criteria. Do you want to use {toTarget} instead?"
              values={{ toTarget: betterQuote?.swapper.name }}
            />
          )}
        </Typography>
        <StyledComparisonContainer>
          {selectedRoute?.willFail && betterQuote && (
            <StyledQuoteContainer>
              <StyledSwapperContainer>
                <TokenIcon isInChip size="24px" token={emptyTokenWithLogoURI(betterQuote.swapper.logoURI)} />
                <Typography variant="body" color="#ffffff">
                  {betterQuote.swapper.name}
                </Typography>
              </StyledSwapperContainer>
              <StyledBetterByContainer>
                <Typography variant="body">{betterMetric}</Typography>
                <Typography variant="bodySmall">
                  <FormattedMessage
                    description="failedQuote transactionCost"
                    defaultMessage="Transaction cost: {cost}"
                    values={{
                      cost: betterQuote.gas?.estimatedCostInUSD
                        ? `$${betterQuote.gas.estimatedCostInUSD.toFixed(2)} (${formatCurrencyAmount(
                            betterQuote.gas.estimatedCost,
                            protocolToken,
                            2,
                            2
                          )} ${protocolToken.symbol})`
                        : '-',
                    }}
                  />
                </Typography>
              </StyledBetterByContainer>
            </StyledQuoteContainer>
          )}
          {selectedRoute && !selectedRoute.willFail && betterQuote && (
            <>
              <StyledQuoteContainer>
                <StyledSwapperContainer>
                  <TokenIcon isInChip size="24px" token={emptyTokenWithLogoURI(selectedRoute.swapper.logoURI)} />
                  <Typography variant="body" color="#ffffff">
                    {selectedRoute.swapper.name}
                  </Typography>
                </StyledSwapperContainer>
                <StyledBetterByContainer>
                  <Typography variant="body">{worseMetric}</Typography>
                  {sorting !== SORT_MOST_RETURN && (
                    <Typography variant="caption">
                      <FormattedMessage
                        description="betterQuoteDataFee"
                        defaultMessage="Tx cost: {gas}"
                        values={{
                          gas: selectedRoute?.gas?.estimatedCostInUSD
                            ? `$${selectedRoute.gas.estimatedCostInUSD.toFixed(2)}`
                            : '-',
                        }}
                      />
                    </Typography>
                  )}
                </StyledBetterByContainer>
              </StyledQuoteContainer>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <EastIcon fontSize="inherit" />
              </Typography>
              <StyledQuoteContainer>
                <StyledSwapperContainer>
                  <TokenIcon isInChip size="24px" token={emptyTokenWithLogoURI(betterQuote.swapper.logoURI)} />
                  <Typography variant="body" color="#ffffff">
                    {betterQuote.swapper.name}
                  </Typography>
                </StyledSwapperContainer>
                <StyledBetterByContainer>
                  <Typography variant="body" color="#219653">
                    {betterMetric}
                  </Typography>
                  <Typography variant="caption">
                    <b>{formatCurrencyAmount(betterBy, emptyTokenWithDecimals(18), 2, 2)}%</b>{' '}
                    {intl.formatMessage(getBetterByLabel(sorting, isBuyOrder))}
                  </Typography>
                  {sorting !== SORT_MOST_RETURN && (
                    <Typography variant="caption">
                      <FormattedMessage
                        description="betterQuoteDataFee"
                        defaultMessage="Tx cost: {gas}"
                        values={{
                          gas: betterQuote?.gas?.estimatedCostInUSD
                            ? `$${betterQuote.gas.estimatedCostInUSD.toFixed(2)}`
                            : '-',
                        }}
                      />
                    </Typography>
                  )}
                </StyledBetterByContainer>
              </StyledQuoteContainer>
            </>
          )}
        </StyledComparisonContainer>
      </StyledBetterQuoteContainer>
    </Modal>
  );
};
export default BetterQuoteModal;
