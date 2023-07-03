import React from 'react';
import styled from 'styled-components';
import Modal from '@common/components/modal';
import EastIcon from '@mui/icons-material/East';
import { FormattedMessage } from 'react-intl';
import { useAppDispatch } from '@state/hooks';
import { setSelectedRoute } from '@state/aggregator/actions';
import useTrackEvent from '@hooks/useTrackEvent';
import TokenIcon from '@common/components/token-icon';
import { emptyTokenWithLogoURI, formatCurrencyAmount, emptyTokenWithDecimals } from '@common/utils/currency';
import { getBetterBy, getBetterByLabel, getQuoteMetric } from '@common/utils/quotes';
import { BigNumber } from 'ethers';
import { BlowfishResponse, StateChangeKind, SwapOption, SwapOptionWithFailure } from '@types';
import { Typography } from '@mui/material';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import { useAggregatorState } from '@state/aggregator/hooks';
import { getProtocolToken } from '@common/mocks/tokens';
import useSelectedNetwork from '@hooks/useSelectedNetwork';

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

  const handleSelectBetterQuote = () => {
    if (!betterQuote) {
      return;
    }
    onCancel();
    dispatch(setSelectedRoute(betterQuote));
    trackEvent('Aggregator - Change better found quote', {
      sourceFrom: selectedRoute?.swapper.name,
      sourceTo: betterQuote.swapper.name,
    });
    onSelectBetterQuote({
      action: 'NONE',
      warnings: [],
      simulationResults: {
        expectedStateChanges: [
          {
            humanReadableDiff: `Sell ${betterQuote.sellAmount.amountInUnits} ${betterQuote.sellToken.symbol}`,
            rawInfo: {
              kind: StateChangeKind.ERC20_TRANSFER,
              data: { amount: { before: '1', after: '0' }, asset: betterQuote.sellToken },
            },
          },
          {
            humanReadableDiff: `Buy ${betterQuote.buyAmount.amountInUnits} ${betterQuote.buyToken.symbol}`,
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
        sourceTo: betterQuote?.swapper.name,
      });

      return;
    }

    if (!betterQuote) {
      return;
    }

    trackEvent('Aggregator - Dont change better found quote', {
      sourceFrom: selectedRoute.swapper.name,
      sourceTo: betterQuote.swapper.name,
    });
    onSelectBetterQuote({
      action: 'NONE',
      warnings: [],
      simulationResults: {
        expectedStateChanges: [
          {
            humanReadableDiff: `Sell ${selectedRoute.sellAmount.amountInUnits} ${selectedRoute.sellToken.symbol}`,
            rawInfo: {
              kind: StateChangeKind.ERC20_TRANSFER,
              data: { amount: { before: '0', after: '0' }, asset: selectedRoute.sellToken },
            },
          },
          {
            humanReadableDiff: `Buy ${selectedRoute.buyAmount.amountInUnits} ${selectedRoute.buyToken.symbol}`,
            rawInfo: {
              kind: StateChangeKind.ERC20_TRANSFER,
              data: { amount: { before: '0', after: '0' }, asset: selectedRoute.buyToken },
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
        <Typography variant="body1">
          {selectedRoute?.willFail ? (
            <FormattedMessage
              description="failedQuote selectBetterQuote"
              defaultMessage="After simulating quotes, we found that {fromTarget} would fail if executed. {toTarget} is currently offering the best successful results. Would you like to use it?"
              values={{ fromTarget: selectedRoute.swapper.name, toTarget: betterQuote?.swapper.name }}
            />
          ) : (
            <FormattedMessage
              description="betterQuote selectBetterQuote"
              defaultMessage="We found that {swapper} gives you a better result based on your search options, do you want to change it?"
              values={{ swapper: betterQuote?.swapper.name || '' }}
            />
          )}
        </Typography>
        <StyledComparisonContainer>
          {selectedRoute?.willFail && betterQuote && (
            <StyledQuoteContainer>
              <StyledSwapperContainer>
                <TokenIcon isInChip size="24px" token={emptyTokenWithLogoURI(betterQuote.swapper.logoURI)} />
                <Typography variant="body1" color="#ffffff">
                  {betterQuote.swapper.name}
                </Typography>
              </StyledSwapperContainer>
              <StyledBetterByContainer>
                <Typography variant="body1">{betterMetric}</Typography>
                <Typography variant="body2">
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
                  <Typography variant="body1" color="#ffffff">
                    {selectedRoute.swapper.name}
                  </Typography>
                </StyledSwapperContainer>
                <StyledBetterByContainer>
                  <Typography variant="body1">{worseMetric}</Typography>
                </StyledBetterByContainer>
              </StyledQuoteContainer>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <EastIcon fontSize="inherit" />
              </Typography>
              <StyledQuoteContainer>
                <StyledSwapperContainer>
                  <TokenIcon isInChip size="24px" token={emptyTokenWithLogoURI(betterQuote.swapper.logoURI)} />
                  <Typography variant="body1" color="#ffffff">
                    {betterQuote.swapper.name}
                  </Typography>
                </StyledSwapperContainer>
                <StyledBetterByContainer>
                  <Typography variant="body1" color="#219653">
                    {betterMetric}
                  </Typography>
                  <Typography variant="caption">
                    <b>{formatCurrencyAmount(betterBy, emptyTokenWithDecimals(18), 2, 2)}%</b>{' '}
                    {getBetterByLabel(sorting, isBuyOrder)}
                  </Typography>
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
