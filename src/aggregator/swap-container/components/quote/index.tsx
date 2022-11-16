import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import * as React from 'react';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import styled from 'styled-components';
import { SwapOption, Token } from 'types';
import TokenIcon from 'common/token-icon';
import Typography from '@mui/material/Typography';
import { emptyTokenWithLogoURI, formatCurrencyAmount } from 'utils/currency';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { withStyles } from '@mui/styles';
import { FormattedMessage } from 'react-intl';

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

const StyledPaper = styled(Paper)<{ $isSelected?: boolean }>`
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  flex-grow: 1;
  background-color: #1d1c1c;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  ${({ $isSelected }) => $isSelected && 'border: 2px solid #3076F6;'}
`;

const StyledTitleContainer = styled.div`
  display: flex;
  flex-grow: 1;
  padding: 8px 16px;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  align-items: center;
`;

const StyledTitleDataContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const StyledRouteContainer = styled.div`
  display: flex;
  padding: 16px;
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

interface SwapQuotesProps {
  quote: SwapOption;
  isSelected?: boolean;
  from: Token | null;
  to: Token | null;
  setRoute: (newRoute: SwapOption) => void;
}

const toPrecision = (value: string) => {
  const precisionRegex = new RegExp(/e\+?/);
  const preciseValue = Number(value).toPrecision(5);

  if (precisionRegex.test(preciseValue)) {
    return preciseValue;
  }

  return parseFloat(preciseValue).toFixed(3);
};

const SwapQuote = ({ quote, isSelected, from, to, setRoute }: SwapQuotesProps) => {
  if (!to || !from) {
    return null;
  }

  return (
    <StyledPaper $isSelected={isSelected} onClick={() => setRoute(quote)}>
      <StyledTitleContainer>
        <StyledTitleDataContainer>
          {isSelected ? (
            <CheckCircleIcon sx={{ color: '#3076F6' }} fontSize="medium" />
          ) : (
            <RadioButtonUncheckedIcon fontSize="medium" />
          )}
          <Typography
            variant="body1"
            sx={{ ...(isSelected ? { color: '#3076F6' } : { color: 'rgba(255, 255, 255, 0.5)' }) }}
          >
            {isSelected ? (
              <FormattedMessage description="selected" defaultMessage="Selected" />
            ) : (
              <FormattedMessage description="select" defaultMessage="Select" />
            )}
          </Typography>
        </StyledTitleDataContainer>
        <StyledTitleDataContainer>
          <DarkChip
            size="small"
            icon={<LocalGasStationIcon fontSize="small" />}
            label={`${toPrecision(quote.gas.estimatedCostInUSD)} $`}
          />
        </StyledTitleDataContainer>
      </StyledTitleContainer>
      <StyledRouteContainer>
        <StyledTokenContainer>
          <TokenIcon token={from} />
          <Typography variant="body1">
            {`${formatCurrencyAmount(quote.sellAmount.amount, from, 4)} ${from.symbol}`}
          </Typography>
        </StyledTokenContainer>
        <StyledDexContainer>
          <DarkChip
            icon={<TokenIcon isInChip size="24px" token={emptyTokenWithLogoURI(quote.swapper.logoURI)} />}
            label={quote.swapper.id}
          />
          <StyledDottedLine />
        </StyledDexContainer>
        <StyledTokenContainer>
          <TokenIcon token={to} />
          <Typography variant="body1">
            {`${formatCurrencyAmount(quote.buyAmount.amount, to, 4)} ${to.symbol}`}
          </Typography>
        </StyledTokenContainer>
      </StyledRouteContainer>
    </StyledPaper>
  );
};

export default SwapQuote;
