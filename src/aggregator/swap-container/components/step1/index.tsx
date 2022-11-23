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
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import { DEFAULT_AGGREGATOR_SETTINGS, GasKeys } from 'config/constants/aggregator';
import Badge from '@mui/material/Badge';
import FormHelperText from '@mui/material/FormHelperText';
import { PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import { formatUnits, parseUnits } from '@ethersproject/units';
import useUsdPrice from 'hooks/useUsdPrice';
import QuoteData from '../quote-data';
import TransferTo from '../transfer-to';

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

const StyledFormHelperText = styled(FormHelperText)`
  cursor: pointer;
`;

const StyledContentContainer = styled.div`
  background-color: #292929;
  padding: 16px;
  border-radius: 8px;
  gap: 16px;
  display: flex;
  flex-direction: column;
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
  align-items: stretch;
`;

const StyledLoadingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StyledTokenButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
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
  transferTo: string | null;
  onOpenTransferTo: () => void;
  onShowSettings: () => void;
  slippage: string;
  gasSpeed: GasKeys;
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
    transferTo,
    onOpenTransferTo,
    onShowSettings,
    slippage,
    gasSpeed,
  } = props;

  let fromValueToUse = isBuyOrder && selectedRoute ? selectedRoute.sellAmount.amountInUnits.toString() : fromValue;
  let toValueToUse = isBuyOrder ? toValue : selectedRoute?.buyAmount.amountInUnits.toString() || '';

  const [fromFetchedPrice] = useUsdPrice(from, parseUnits(fromValueToUse || '0', from?.decimals));
  const [toFetchedPrice] = useUsdPrice(to, parseUnits(toValueToUse || '0', to?.decimals));
  const fromPrice = selectedRoute?.sellAmount.amountInUSD;
  const toPrice = selectedRoute?.buyAmount.amountInUSD;

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

  const onSetMaxBalance = () => {
    if (balance && from) {
      if (from.address === PROTOCOL_TOKEN_ADDRESS) {
        const maxValue = balance.gte(parseUnits('1', from.decimals))
          ? balance.sub(parseUnits('0.1', from.decimals))
          : balance;
        handleFromValueChange(formatUnits(maxValue, from.decimals));
      } else {
        handleFromValueChange(formatUnits(balance, from.decimals));
      }
    }
  };

  const hasNonDefaultSettings =
    slippage !== DEFAULT_AGGREGATOR_SETTINGS.slippage.toString() || gasSpeed !== DEFAULT_AGGREGATOR_SETTINGS.gasSpeed;

  return (
    <StyledGrid container rowSpacing={2} ref={ref}>
      <Grid item xs={12}>
        <StyledContentContainer>
          <StyledTokensContainer>
            <StyledTitleContainer>
              <Typography variant="body1">
                <FormattedMessage description="youPay" defaultMessage="You pay" />
              </Typography>
              <Badge color="warning" variant="dot" invisible={!hasNonDefaultSettings}>
                <IconButton aria-label="settings" size="small" onClick={onShowSettings}>
                  <SettingsIcon fontSize="inherit" />
                </IconButton>
              </Badge>
            </StyledTitleContainer>
            <StyledTokenInputContainer>
              <TokenInput
                id="from-value"
                error={cantFund ? 'Amount cannot exceed balance' : ''}
                value={fromValueToUse}
                disabled={isLoadingBuyOrder}
                onChange={handleFromValueChange}
                token={from}
                fullWidth
                usdValue={parseFloat(fromPrice || fromFetchedPrice?.toFixed(2) || '0').toFixed(2)}
              />
              <StyledTokenButtonContainer>
                {balance && from && (
                  <StyledFormHelperText onClick={onSetMaxBalance}>
                    <FormattedMessage
                      description="in wallet"
                      defaultMessage="Balance: {balance}"
                      values={{
                        balance: formatCurrencyAmount(balance, from, 4),
                      }}
                    />
                  </StyledFormHelperText>
                )}
                <TokenButton token={from} onClick={() => startSelectingCoin(from || emptyTokenWithAddress('from'))} />
              </StyledTokenButtonContainer>
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
                usdValue={parseFloat(toPrice || toFetchedPrice?.toFixed(2) || '0').toFixed(2)}
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
        <StyledContentContainer>
          <TransferTo transferTo={transferTo} onOpenTransferTo={onOpenTransferTo} />
          <QuoteData quote={selectedRoute} to={to} />
          {buttonToShow}
        </StyledContentContainer>
      </Grid>
    </StyledGrid>
  );
});

export default SwapFirstStep;
