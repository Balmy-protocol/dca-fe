import React from 'react';
import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import { SwapOption, Token } from 'types';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import TokenButton from 'common/token-button';
import TokenInput from 'common/token-input';
import { emptyTokenWithAddress, formatCurrencyAmount } from 'utils/currency';
import { BigNumber } from 'ethers';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';

const StyledGrid = styled(Grid)`
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 90;
`;

const StyledTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledContentContainer = styled.div`
  background-color: #292929;
  padding: 16px;
  border-radius: 8px;
`;

const StyledTokensContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
`;

const StyledTokenInputContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 30px;
`;

const StyledLoadingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

interface SwapFirstStepProps {
  from: Token | null;
  fromValue: string;
  to: Token | null;
  toValue: string;
  startSelectingCoin: (token: Token) => void;
  cantFund: boolean | null;
  handleFromValueChange: (newValue: string) => void;
  handleToValueChange: (newValue: string) => void;
  balance?: BigNumber;
  buttonToShow: React.ReactNode;
  selectedRoute: SwapOption | null;
  isBuyOrder: boolean;
  isLoadingRoute: boolean;
}

const SwapFirstStep = React.forwardRef<HTMLDivElement, SwapFirstStepProps>((props, ref) => {
  const {
    from,
    to,
    fromValue,
    toValue,
    startSelectingCoin,
    cantFund,
    handleFromValueChange,
    handleToValueChange,
    balance,
    buttonToShow,
    selectedRoute,
    isBuyOrder,
    isLoadingRoute,
  } = props;

  let fromValueToUse = isBuyOrder && selectedRoute ? selectedRoute.sellAmount.amountInUnits.toString() : fromValue;
  let toValueToUse = isBuyOrder ? toValue : selectedRoute?.buyAmount.amountInUnits.toString() || '';

  let isLoadingSellOrder = false;
  let isLoadingBuyOrder = false;

  if (isLoadingRoute) {
    if (isBuyOrder) {
      fromValueToUse = '...';
      isLoadingBuyOrder = true;
    } else {
      toValueToUse = '...';
      isLoadingSellOrder = true;
    }
  }

  return (
    <StyledGrid container rowSpacing={2} ref={ref}>
      <Grid item xs={12}>
        <StyledContentContainer>
          <StyledTokensContainer>
            <StyledTitleContainer>
              <Typography variant="body1">
                <FormattedMessage description="youPay" defaultMessage="You pay" />
              </Typography>
              {balance && from && (
                <FormHelperText>
                  <FormattedMessage
                    description="in wallet"
                    defaultMessage="Balance: {balance} {symbol}"
                    values={{
                      balance: formatCurrencyAmount(balance, from, 4),
                      symbol: from.symbol,
                    }}
                  />
                </FormHelperText>
              )}
            </StyledTitleContainer>
            <StyledTokenInputContainer>
              <TokenInput
                id="from-value"
                error={cantFund ? 'Amount cannot exceed balance' : ''}
                value={fromValueToUse}
                disabled={isLoadingBuyOrder}
                onChange={handleFromValueChange}
                withBalance={false}
                balance={balance}
                token={from}
                withMax
                fullWidth
              />
              <TokenButton token={from} onClick={() => startSelectingCoin(from || emptyTokenWithAddress('from'))} />
            </StyledTokenInputContainer>
            {isLoadingBuyOrder && (
              <StyledLoadingContainer>
                <CircularProgress size={20} />
                <Typography variant="caption">
                  <FormattedMessage description="loading best price" defaultMessage="Fetching best price.." />
                </Typography>
              </StyledLoadingContainer>
            )}
          </StyledTokensContainer>
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>
          <StyledTokensContainer>
            <StyledTitleContainer>
              <Typography variant="body1">
                <FormattedMessage description="youReceive" defaultMessage="You receive" />
              </Typography>
            </StyledTitleContainer>
            <StyledTokenInputContainer>
              <TokenInput
                id="to-value"
                value={toValueToUse}
                disabled={isLoadingSellOrder}
                onChange={handleToValueChange}
                withBalance={false}
                token={to}
                fullWidth
              />
              <TokenButton token={to} onClick={() => startSelectingCoin(to || emptyTokenWithAddress('to'))} />
            </StyledTokenInputContainer>
            {isLoadingSellOrder && (
              <StyledLoadingContainer>
                <CircularProgress size={20} />
                <Typography variant="caption">
                  <FormattedMessage description="loading best price" defaultMessage="Fetching best price.." />
                </Typography>
              </StyledLoadingContainer>
            )}
          </StyledTokensContainer>
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>{buttonToShow}</StyledContentContainer>
      </Grid>
    </StyledGrid>
  );
});

export default SwapFirstStep;
