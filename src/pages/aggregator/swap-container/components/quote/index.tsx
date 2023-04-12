import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import isNaN from 'lodash/isNaN';
import isUndefined from 'lodash/isUndefined';
import isFinite from 'lodash/isFinite';
import * as React from 'react';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import styled from 'styled-components';
import { SwapOption, Token } from 'types';
import TokenIcon from 'common/components/token-icon';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Typography from '@mui/material/Typography';
import { emptyTokenWithLogoURI, formatCurrencyAmount } from 'common/utils/currency';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { withStyles } from '@mui/styles';
import { FormattedMessage } from 'react-intl';
import { parseUnits } from '@ethersproject/units';
import { SORT_MOST_PROFIT, SORT_MOST_RETURN, SwapSortOptions } from 'config/constants/aggregator';
import useSpecificAllowance from 'hooks/useSpecificAllowance';
import { MAX_BI } from 'config';
import { BigNumber } from 'ethers';
import { useAggregatorSettingsState } from 'state/aggregator-settings/hooks';

const DarkChip = withStyles(() => ({
  root: {
    background: 'rgb(59 58 59)',
    color: 'rgba(255, 255, 255, 0.5)',
    zIndex: '2',
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.5) !important',
  },
}))(Chip);

const StatusChip = withStyles(() => ({
  colorSuccess: {
    background: 'rgba(33, 150, 83, 0.1)',
    color: '#219653',
  },
  colorError: {
    background: 'rgba(235, 87, 87, 0.1)',
    color: '#EB5757',
  },
}))(Chip);

const StyledPaper = styled(Paper)<{ $isSelected?: boolean; $disabled: boolean }>`
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  flex-grow: 1;
  background-color: #1d1c1c;
  display: flex;
  flex-direction: column;
  ${({ $disabled }) => !$disabled && 'cursor: pointer;'}
  ${({ $isSelected }) => $isSelected && 'border: 2px solid #3076F6;'}
`;

const StyledOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
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
    background-color: rgb(148 148 148);
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
`;

const StyledUsdContainer = styled.div`
  display: flex;
  gap: 5px;
`;

interface SwapQuotesProps {
  quote: SwapOption;
  isSelected?: boolean;
  from: Token | null;
  to: Token | null;
  setRoute: (newRoute: SwapOption) => void;
  isBuyOrder: boolean;
  bestQuote?: SwapOption;
  sorting: SwapSortOptions;
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

const SwapQuote = ({
  quote,
  isSelected,
  from,
  to,
  setRoute,
  isBuyOrder,
  bestQuote,
  sorting,
  disabled,
}: SwapQuotesProps) => {
  const { showTransactionCost: showTransactionCostConfig } = useAggregatorSettingsState();

  if (!to || !from) {
    return null;
  }

  let isWorsePrice = false;

  const [allowance] = useSpecificAllowance(quote.sellToken, quote.swapper.allowanceTarget);

  const parsedAllowance = allowance.allowance && parseUnits(allowance.allowance || '0', quote.sellToken.decimals);
  const isApproved = (parsedAllowance || MAX_BI).gte(BigNumber.from(quote.maxSellAmount.amount));

  if (isBuyOrder) {
    isWorsePrice = quote.sellAmount.amount.gt(bestQuote?.sellAmount.amount || 0);
  } else {
    isWorsePrice = quote.buyAmount.amount.lt(bestQuote?.buyAmount.amount || 0);
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
            <CheckCircleIcon sx={{ color: '#3076F6' }} fontSize="medium" />
          ) : (
            !disabled && <RadioButtonUncheckedIcon fontSize="medium" />
          )}
          <Typography
            variant="body1"
            sx={{ ...(isSelected ? { color: '#3076F6' } : { color: 'rgba(255, 255, 255, 0.5)' }) }}
          >
            {isSelected ? (
              <FormattedMessage description="selected" defaultMessage="Selected" />
            ) : (
              !disabled && <FormattedMessage description="select" defaultMessage="Select" />
            )}
          </Typography>
        </StyledTitleDataContainer>
        <StyledTitleDataContainer $end>
          {!isApproved && (
            <StatusChip
              label={<FormattedMessage description="needsApproval" defaultMessage="Needs approval" />}
              color="default"
              variant="outlined"
              size="small"
            />
          )}
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
          {quote.gas?.estimatedCost.gt(bestQuote?.gas?.estimatedCost || 0) && (
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
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
            <Typography variant="body1">
              {`${formatCurrencyAmount(quote.sellAmount.amount, quote.sellToken, 4, 6)} ${quote.sellToken.symbol}`}
            </Typography>
            {!isUndefined(quote.sellAmount.amountInUSD) && (
              <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
                {`$${parseFloat(quote.sellAmount.amountInUSD.toString()).toFixed(2)}`}
              </Typography>
            )}
            {isUndefined(quote.sellAmount.amountInUSD) && (
              <Typography variant="caption" color="#EB5757">
                <FormattedMessage description="unkown" defaultMessage="Unknown price" />
              </Typography>
            )}
          </StyledTokenAmountContainer>
        </StyledTokenContainer>
        <StyledDexContainer>
          <DarkChip
            icon={<TokenIcon isInChip size="24px" token={emptyTokenWithLogoURI(quote.swapper.logoURI)} />}
            label={quote.swapper.name}
          />
          <StyledDottedLine />
        </StyledDexContainer>
        <StyledTokenContainer>
          <TokenIcon token={quote.buyToken} />
          <StyledTokenAmountContainer>
            <Typography variant="body1">
              {`${formatCurrencyAmount(quote.buyAmount.amount, quote.buyToken, 4, 6)} ${quote.buyToken.symbol}`}
            </Typography>
            <StyledUsdContainer>
              {!isUndefined(quote.buyAmount.amountInUSD) && (
                <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
                  {`$${parseFloat(quote.buyAmount.amountInUSD.toString()).toFixed(2)}`}
                </Typography>
              )}
              {isUndefined(quote.buyAmount.amountInUSD) && (
                <Typography variant="caption" color="#EB5757">
                  <FormattedMessage description="unkown" defaultMessage="Unknown price" />
                </Typography>
              )}
              {!isNaN(priceImpact) && isFinite(Number(priceImpact)) && priceImpact && (
                <Typography
                  variant="caption"
                  color={
                    // eslint-disable-next-line no-nested-ternary
                    Number(priceImpact) < -2.5
                      ? '#EB5757'
                      : Number(priceImpact) > 0
                      ? '#219653'
                      : 'rgba(255, 255, 255, 0.5)'
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
            <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
              <FormattedMessage description="aggregatorAfterTransaction" defaultMessage="After transaction cost:" />
            </Typography>
            <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
              {`$${buyAfterTxCost.toFixed(2)}`}
            </Typography>
            {!isNaN(priceImpactAfterTxCost) && isFinite(Number(priceImpactAfterTxCost)) && priceImpactAfterTxCost && (
              <Typography
                variant="caption"
                color={
                  // eslint-disable-next-line no-nested-ternary
                  Number(priceImpactAfterTxCost) < -5
                    ? '#EB5757'
                    : Number(priceImpactAfterTxCost) > 0
                    ? '#219653'
                    : 'rgba(255, 255, 255, 0.5)'
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
          <ErrorOutlineIcon fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
          <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
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
