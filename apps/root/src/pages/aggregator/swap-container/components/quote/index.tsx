import isNaN from 'lodash/isNaN';
import isUndefined from 'lodash/isUndefined';
import isFinite from 'lodash/isFinite';
import * as React from 'react';
import styled from 'styled-components';
import { SwapOption } from '@types';
import TokenIcon from '@common/components/token-icon';
import {
  Typography,
  Chip,
  Paper,
  LocalGasStationIcon,
  ErrorOutlineIcon,
  CheckCircleIcon,
  RadioButtonUncheckedIcon,
  baseColors,
  colors,
} from 'ui-library';
import { emptyTokenWithLogoURI, formatCurrencyAmount, formatUsdAmount } from '@common/utils/currency';
import { withStyles } from 'tss-react/mui';
import { FormattedMessage, useIntl } from 'react-intl';
import { SORT_MOST_PROFIT, SORT_MOST_RETURN } from '@constants/aggregator';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import { useAggregatorState } from '@state/aggregator/hooks';
import { setSelectedRoute } from '@state/aggregator/actions';
import { useAppDispatch } from '@state/hooks';
import useAnalytics from '@hooks/useAnalytics';
import { useThemeMode } from '@state/config/hooks';

const DarkChip = withStyles(Chip, () => ({
  root: {
    background: 'rgb(59 58 59)',
    color: baseColors.disabledText,
    zIndex: '2',
  },
  icon: {
    color: `${baseColors.disabledText} !important`,
  },
}));

const StatusChip = withStyles(Chip, ({ palette: { mode } }) => ({
  colorSuccess: {
    background: colors[mode].semanticBackground.success,
    color: colors[mode].semantic.success.primary,
  },
  colorError: {
    background: colors[mode].semanticBackground.error,
    color: colors[mode].semantic.error.primary,
  },
}));

const StyledPaper = styled(Paper)<{ $isSelected?: boolean; $disabled: boolean }>`
  ${({
    $disabled,
    $isSelected,
    theme: {
      palette: { mode },
    },
  }) => `
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    ${!$disabled && 'cursor: pointer;'}
    ${$isSelected && `border: 1.5px solid ${colors[mode].violet.violet200};`}
  `}
`;

const StyledOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background: ${baseColors.overlay};
`;

const StyledNotSupportedContainer = styled.div`
  display: flex;
  flex-grow: 1;
  padding: 8px 16px;
  gap: 5px;
`;

const StyledTransactionCostContainer = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: flex-end;
  padding: 8px 16px;
  gap: 5px;
`;

const StyledTitleContainer = styled.div`
  display: flex;
  flex-grow: 1;
  padding: 8px 16px;
  justify-content: space-between;
  border-bottom: 1px solid ${baseColors.disabledText};
  align-items: center;
`;

const StyledTitleDataContainer = styled.div<{ $end?: boolean }>`
  display: flex;
  gap: 4px;
  align-items: center;
  ${({ $end }) => $end && 'flex-wrap: wrap;justify-content: flex-end;'}
`;

const StyledRouteContainer = styled.div<{ withMessage?: boolean }>`
  display: flex;
  padding: ${({ withMessage }) => (withMessage ? '16px 16px 0px 16px' : '16px')};
  align-items: center;
`;

const StyledTokenContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StyledDexContainer = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  justify-content: center;
  position: relative;
  margin: 0px 8px;
`;

const StyledDottedLine = styled.div`
  position: absolute;
  top: 50%;
  left: 0px;
  right: 0px;
  height: 1px;
  border: 1px dashed rgb(148 148 148);
  z-index: 1;
  &:after {
    content: '';
    position: absolute;
    top: -3px;
    bottom: 0;
    right: 0;
    width: 6px;
    height: 6px;
    border: solid rgb(148 148 148);
    border-width: 0 2px 2px 0;
    display: inline-block;
    transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
  }
  &:before {
    content: '';
    position: absolute;
    border-radius: 20px;
    box-shadow: 0 4px 12px 0 rgb(0 0 0 / 16%);
    top: -5px;
    bottom: 0;
    left: -5px;
    right: 0;
    width: 10px;
    height: 10px;
  }
`;

const StyledTokenAmountContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 10px;
  justify-content: center;
`;

const StyledUsdContainer = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
`;

interface SwapQuotesProps {
  quote: SwapOption;
  isSelected?: boolean;
  bestQuote?: SwapOption;
  disabled: boolean;
}

const toPrecision = (value: string) => {
  const precisionRegex = new RegExp(/e\+?/);
  const preciseValue = Number(value).toPrecision(5);

  if (precisionRegex.test(preciseValue)) {
    return preciseValue;
  }

  return parseFloat(preciseValue).toFixed(3);
};

const SwapQuote = ({ quote, isSelected, bestQuote, disabled }: SwapQuotesProps) => {
  const { showTransactionCost: showTransactionCostConfig, sorting } = useAggregatorSettingsState();
  const { from, to, isBuyOrder, selectedRoute } = useAggregatorState();
  const dispatch = useAppDispatch();
  const { trackEvent } = useAnalytics();
  const mode = useThemeMode();
  const intl = useIntl();

  if (!to || !from) {
    return null;
  }

  const setRoute = (newRoute: SwapOption) => {
    dispatch(setSelectedRoute(newRoute));
    trackEvent('Aggregator - Change selected route', {
      fromSource: selectedRoute?.swapper.id,
      toSource: newRoute.swapper.id,
    });
  };

  let isWorsePrice = false;

  if (isBuyOrder) {
    isWorsePrice = quote.sellAmount.amount > (bestQuote?.sellAmount.amount || 0n);
  } else {
    isWorsePrice = quote.buyAmount.amount > (bestQuote?.buyAmount.amount || 0n);
  }

  const priceImpact =
    quote &&
    !!quote.buyAmount.amountInUSD &&
    !!quote.sellAmount.amountInUSD &&
    (
      Math.round(
        ((Number(quote.buyAmount.amountInUSD) - Number(quote.sellAmount.amountInUSD)) /
          Number(quote.sellAmount.amountInUSD)) *
          10000
      ) / 100
    ).toFixed(2);

  const showTransactionCost = showTransactionCostConfig && sorting === SORT_MOST_PROFIT;

  const buyAfterTxCost =
    quote &&
    showTransactionCost &&
    !!quote.buyAmount.amountInUSD &&
    !!quote.gas?.estimatedCostInUSD &&
    Math.round((quote.buyAmount.amountInUSD - quote.gas.estimatedCostInUSD) * 100) / 100;

  const priceImpactAfterTxCost =
    showTransactionCost &&
    !!quote.sellAmount.amountInUSD &&
    !!buyAfterTxCost &&
    (
      Math.round(
        ((buyAfterTxCost - Number(quote.sellAmount.amountInUSD)) / Number(quote.sellAmount.amountInUSD)) * 10000
      ) / 100
    ).toFixed(2);

  return (
    <StyledPaper $isSelected={isSelected} onClick={() => !disabled && setRoute(quote)} $disabled={disabled}>
      {disabled && !isSelected && <StyledOverlay />}
      <StyledTitleContainer>
        <StyledTitleDataContainer>
          {isSelected ? (
            <CheckCircleIcon sx={{ color: colors[mode].violet.violet200 }} fontSize="medium" />
          ) : (
            !disabled && <RadioButtonUncheckedIcon fontSize="medium" />
          )}
          <Typography
            variant="bodyRegular"
            sx={{ ...(isSelected ? { color: colors[mode].violet.violet200 } : { color: baseColors.disabledText }) }}
          >
            {isSelected ? (
              <FormattedMessage description="selected" defaultMessage="Selected" />
            ) : (
              !disabled && <FormattedMessage description="select" defaultMessage="Select" />
            )}
          </Typography>
        </StyledTitleDataContainer>
        <StyledTitleDataContainer $end>
          {/* {!isApproved && (
            <StatusChip
              label={<FormattedMessage description="needsApproval" defaultMessage="Needs approval" />}
              color="primary"
              variant="outlined"
              size="small"
            />
          )} */}
          {sorting === SORT_MOST_PROFIT && isWorsePrice && (
            <StatusChip
              label={<FormattedMessage description="worsePrice" defaultMessage="Worse price" />}
              color="error"
              variant="filled"
              size="small"
            />
          )}
          {sorting === SORT_MOST_RETURN && isWorsePrice && (
            <StatusChip
              label={<FormattedMessage description="worsePrice" defaultMessage="Worse price" />}
              color="error"
              variant="filled"
              size="small"
            />
          )}
          {(quote.gas?.estimatedCost || 0n) > (bestQuote?.gas?.estimatedCost || 0n) && (
            <StatusChip
              label={<FormattedMessage description="moreGas" defaultMessage="More gas" />}
              color="error"
              variant="filled"
              size="small"
            />
          )}
          {bestQuote?.swapper.name === quote.swapper.name && (
            <StatusChip
              label={<FormattedMessage description="best" defaultMessage="Best" />}
              color="success"
              variant="filled"
              size="small"
            />
          )}
          {!isUndefined(quote.gas?.estimatedCostInUSD) && (
            <DarkChip
              size="small"
              icon={<LocalGasStationIcon fontSize="small" />}
              // Disabling since we are sure this existis due to the previous check
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
              label={`${toPrecision(quote.gas!.estimatedCostInUSD.toString())} $`}
            />
          )}
          {isUndefined(quote.gas?.estimatedCostInUSD) && (
            <DarkChip
              size="small"
              icon={<LocalGasStationIcon fontSize="small" />}
              label={<FormattedMessage description="unkown" defaultMessage="Unknown" />}
            />
          )}
        </StyledTitleDataContainer>
      </StyledTitleContainer>
      <StyledRouteContainer
        withMessage={(isBuyOrder && quote.type !== 'buy') || (!!buyAfterTxCost && showTransactionCost)}
      >
        <StyledTokenContainer>
          <TokenIcon token={quote.sellToken} />
          <StyledTokenAmountContainer>
            <Typography variant="bodyRegular">
              {`${formatCurrencyAmount({
                amount: quote.sellAmount.amount,
                token: quote.sellToken,
                sigFigs: 4,
                maxDecimals: 6,
                intl,
              })} ${from?.symbol || quote.sellToken.symbol}`}
            </Typography>
            {!isUndefined(quote.sellAmount.amountInUSD) && (
              <Typography variant="caption" color={colors[mode].typography.typo3}>
                {`$${formatUsdAmount({ amount: quote.sellAmount.amountInUSD, intl })}`}
              </Typography>
            )}
            {isUndefined(quote.sellAmount.amountInUSD) && (
              <Typography variant="caption" color={colors[mode].semantic.error.primary}>
                <FormattedMessage description="unkown" defaultMessage="Unknown price" />
              </Typography>
            )}
          </StyledTokenAmountContainer>
        </StyledTokenContainer>
        <StyledDexContainer>
          <DarkChip
            icon={<TokenIcon isInChip size={6} token={emptyTokenWithLogoURI(quote.swapper.logoURI)} />}
            label={quote.swapper.name}
          />
          <StyledDottedLine />
        </StyledDexContainer>
        <StyledTokenContainer>
          <TokenIcon token={quote.buyToken} />
          <StyledTokenAmountContainer>
            <Typography variant="bodyRegular">
              {`${formatCurrencyAmount({
                amount: quote.buyAmount.amount,
                token: quote.buyToken,
                sigFigs: 4,
                maxDecimals: 6,
                intl,
              })} ${to?.symbol || quote.buyToken.symbol}`}
            </Typography>
            <StyledUsdContainer>
              {!isUndefined(quote.buyAmount.amountInUSD) && (
                <Typography variant="caption" color={colors[mode].typography.typo3}>
                  {`$${formatUsdAmount({ amount: quote.buyAmount.amountInUSD, intl })}`}
                </Typography>
              )}
              {isUndefined(quote.buyAmount.amountInUSD) && (
                <Typography variant="caption" color={colors[mode].semantic.error.primary}>
                  <FormattedMessage description="unkown" defaultMessage="Unknown price" />
                </Typography>
              )}
              {!isNaN(priceImpact) && isFinite(Number(priceImpact)) && priceImpact && (
                <Typography
                  variant="caption"
                  color={
                    // eslint-disable-next-line no-nested-ternary
                    Number(priceImpact) < -2.5
                      ? colors[mode].semantic.error.primary
                      : Number(priceImpact) > 0
                        ? colors[mode].semantic.success.primary
                        : baseColors.disabledText
                  }
                >
                  {`(${Number(priceImpact) > 0 ? '+' : ''}${priceImpact}%)`}
                </Typography>
              )}
            </StyledUsdContainer>
          </StyledTokenAmountContainer>
        </StyledTokenContainer>
      </StyledRouteContainer>
      {buyAfterTxCost && showTransactionCost && (
        <StyledTransactionCostContainer>
          <StyledUsdContainer>
            <Typography variant="caption" color={colors[mode].typography.typo3}>
              <FormattedMessage description="aggregatorAfterTransaction" defaultMessage="After transaction cost:" />
            </Typography>
            <Typography variant="caption" color={colors[mode].typography.typo3}>
              {`$${formatUsdAmount({ amount: buyAfterTxCost, intl })}`}
            </Typography>
            {!isNaN(priceImpactAfterTxCost) && isFinite(Number(priceImpactAfterTxCost)) && priceImpactAfterTxCost && (
              <Typography
                variant="caption"
                color={
                  // eslint-disable-next-line no-nested-ternary
                  Number(priceImpactAfterTxCost) < -5
                    ? colors[mode].semantic.error.primary
                    : Number(priceImpactAfterTxCost) > 0
                      ? colors[mode].semantic.success.primary
                      : baseColors.disabledText
                }
              >
                {`(${Number(priceImpactAfterTxCost) > 0 ? '+' : ''}${priceImpactAfterTxCost}%)`}
              </Typography>
            )}
          </StyledUsdContainer>
        </StyledTransactionCostContainer>
      )}
      {isBuyOrder && quote.type !== 'buy' && (
        <StyledNotSupportedContainer>
          <ErrorOutlineIcon fontSize="small" sx={{ color: colors[mode].typography.typo3 }} />
          <Typography variant="caption" color={colors[mode].typography.typo3}>
            <FormattedMessage
              description="aggregatorNotBuyOrder"
              defaultMessage="The value of the transaction is estimated because this exchange does not support setting amount received."
            />
          </Typography>
        </StyledNotSupportedContainer>
      )}
    </StyledPaper>
  );
};

export default SwapQuote;
