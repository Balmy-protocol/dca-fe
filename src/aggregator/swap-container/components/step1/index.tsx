import React from 'react';
import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import Button from 'common/button';
import { SwapOption, Token } from 'types';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { emptyTokenWithAddress, formatCurrencyAmount, toToken } from 'utils/currency';
import Tooltip from '@mui/material/Tooltip';
import { BigNumber } from 'ethers';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { MenuItem, Select } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { DEFAULT_AGGREGATOR_SETTINGS, GasKeys } from 'config/constants/aggregator';
import Badge from '@mui/material/Badge';
import FormHelperText from '@mui/material/FormHelperText';
import { PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import { formatUnits, parseUnits } from '@ethersproject/units';
import useUsdPrice from 'hooks/useUsdPrice';
import find from 'lodash/find';
import TokenIcon from 'common/token-icon';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import useSelectedNetwork from 'hooks/useSelectedNetwork';
import { getGhTokenListLogoUrl, NETWORKS, REMOVED_AGG_CHAINS } from 'config';
import { getAllChains } from '@mean-finance/sdk';
import useSdkChains from 'hooks/useSdkChains';
import useAccount from 'hooks/useAccount';
import QuoteData from '../quote-data';
import TransferTo from '../transfer-to';
import AggregatorTokenInput from './aggtokenButton';
import QuoteSimulation from '../quote-simulation';

const StyledButton = styled(Button)`
  padding: 0;
  min-width: 10px;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  flex: 1;
  gap: 10px;
`;

const StyledIconButton = styled(Button)`
  border-radius: 12px;
  min-width: 45px;
`;

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
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StyledCogContainer = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  display: flex;
  border: 3px solid #151515;
  border-radius: 20px;
  background: #151515;
`;

const StyledContentContainer = styled.div<{ hasArrow?: boolean }>`
  background-color: #292929;
  position: relative;
  padding: 16px;
  border-radius: 8px;
  gap: 16px;
  display: flex;
  flex-direction: column;
  ${({ hasArrow }) => hasArrow && 'padding-bottom: 30px;'}
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

const StyledToggleContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  position: absolute;
  left: calc(50% - 24px);
  bottom: -30px;
  z-index: 2;
`;

const StyledToggleTokenButton = styled(IconButton)`
  border: 4px solid #1b1821;
  background-color: #292929;
  :hover {
    background-color: #484848;
  }
`;

const StyledNetworkButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
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
  toggleFromTo: () => void;
  balance?: BigNumber;
  buttonToShow: React.ReactNode;
  selectedRoute: SwapOption | null;
  isBuyOrder: boolean;
  isLoadingRoute: boolean;
  transferTo: string | null;
  onOpenTransferTo: () => void;
  onShowSettings: () => void;
  slippage: string;
  isApproved: boolean;
  disabledDexes: string[];
  setTransactionWillFail: (transactionWillFail: boolean) => void;
  gasSpeed: GasKeys;
  onChangeNetwork: (chainId: number) => void;
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
    toggleFromTo,
    transferTo,
    onOpenTransferTo,
    onShowSettings,
    slippage,
    gasSpeed,
    disabledDexes,
    isApproved,
    onChangeNetwork,
    setTransactionWillFail,
  } = props;

  const account = useAccount();

  let fromValueToUse =
    isBuyOrder && selectedRoute
      ? (selectedRoute?.sellToken.address === from?.address &&
          formatUnits(selectedRoute.sellAmount.amount, selectedRoute.sellToken.decimals)) ||
        '0'
      : fromValue;
  let toValueToUse = isBuyOrder
    ? toValue
    : (selectedRoute?.buyToken.address === to?.address &&
        formatUnits(selectedRoute?.buyAmount.amount || '0', selectedRoute?.buyToken.decimals)) ||
      '0' ||
      '';

  const selectedNetwork = useSelectedNetwork();
  const currentNetwork = useCurrentNetwork();

  const [fromFetchedPrice] = useUsdPrice(
    from,
    parseUnits(fromValueToUse || '0', selectedRoute?.sellToken.decimals || from?.decimals),
    undefined,
    selectedNetwork.chainId
  );
  const [toFetchedPrice] = useUsdPrice(
    to,
    parseUnits(toValueToUse || '0', selectedRoute?.buyToken.decimals || to?.decimals),
    undefined,
    selectedNetwork.chainId
  );
  const supportedChains = useSdkChains();
  const fromPrice = selectedRoute?.sellAmount.amountInUSD;
  const toPrice = selectedRoute?.buyAmount.amountInUSD;

  if (isLoadingRoute) {
    if (isBuyOrder) {
      fromValueToUse = '...';
    } else {
      toValueToUse = '...';
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
    slippage !== DEFAULT_AGGREGATOR_SETTINGS.slippage.toString() ||
    gasSpeed !== DEFAULT_AGGREGATOR_SETTINGS.gasSpeed ||
    !!disabledDexes.length;

  const priceImpact =
    selectedRoute &&
    !!selectedRoute.buyAmount.amountInUSD &&
    !!selectedRoute.sellAmount.amountInUSD &&
    (
      Math.round(
        ((Number(selectedRoute.buyAmount.amountInUSD) - Number(selectedRoute.sellAmount.amountInUSD)) /
          Number(selectedRoute.sellAmount.amountInUSD)) *
          10000
      ) / 100
    ).toFixed(2);

  return (
    <StyledGrid container rowSpacing={2} ref={ref}>
      <Grid item xs={12} sx={{ position: 'relative' }}>
        <StyledContentContainer>
          <StyledCogContainer>
            <Badge color="warning" variant="dot" invisible={!hasNonDefaultSettings}>
              <IconButton aria-label="settings" size="small" sx={{ padding: '3px' }} onClick={onShowSettings}>
                <SettingsIcon fontSize="inherit" />
              </IconButton>
            </Badge>
          </StyledCogContainer>
          {/* rate */}
          <StyledTokensContainer>
            <Typography variant="body1">
              <FormattedMessage description="supportedNetworks" defaultMessage="Choose network:" />
            </Typography>
            <StyledNetworkButtonsContainer>
              <Select
                id="choose-network"
                fullWidth
                value={selectedNetwork.chainId}
                onChange={(evt) => onChangeNetwork(Number(evt.target.value))}
                size="small"
                SelectDisplayProps={{ style: { display: 'flex', alignItems: 'center', gap: '5px' } }}
              >
                {supportedChains
                  .filter((chain) => !REMOVED_AGG_CHAINS.includes(chain))
                  .map((networkId) => {
                    const foundSdkNetwork = find(
                      getAllChains().filter((chain) => !chain.testnet),
                      { chainId: networkId }
                    );
                    const foundNetwork = find(NETWORKS, { chainId: networkId });

                    if (!foundSdkNetwork) {
                      return null;
                    }

                    return (
                      <MenuItem sx={{ display: 'flex', alignItems: 'center', gap: '5px' }} value={networkId}>
                        <TokenIcon
                          size="20px"
                          token={toToken({
                            address: foundNetwork?.mainCurrency || foundSdkNetwork.wToken,
                            chainId: networkId,
                            logoURI: getGhTokenListLogoUrl(networkId, 'logo'),
                          })}
                        />
                        {foundSdkNetwork.name}
                      </MenuItem>
                      // <Tooltip title={foundSdkNetwork.name} arrow placement="top">
                      //   <div>
                      //     <StyledNetworkButton
                      //       variant="outlined"
                      //       color={selectedNetwork.chainId === network.chainId ? 'secondary' : 'default'}
                      //       size="small"
                      //       onClick={() => onChangeNetwork(network.chainId)}
                      //     >
                      //       <TokenIcon size="20px" token={emptyTokenWithAddress(foundNetwork?.mainCurrency || foundSdkNetwork.wToken)} />
                      //     </StyledNetworkButton>
                      //   </div>
                      // </Tooltip>
                    );
                  })}
              </Select>
            </StyledNetworkButtonsContainer>
          </StyledTokensContainer>
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12} sx={{ position: 'relative' }}>
        <StyledContentContainer hasArrow>
          <StyledTokensContainer>
            <StyledTitleContainer>
              <Typography variant="body1">
                <FormattedMessage description="youPay" defaultMessage="You pay" />
              </Typography>
              {balance && from && currentNetwork.chainId === selectedNetwork.chainId && (
                <StyledFormHelperText onClick={onSetMaxBalance}>
                  <FormattedMessage
                    description="in wallet"
                    defaultMessage="Balance: {balance}"
                    values={{
                      balance: formatCurrencyAmount(balance, from, 4),
                    }}
                  />
                  <StyledButton onClick={onSetMaxBalance} color="secondary" variant="text">
                    <FormattedMessage description="maxWallet" defaultMessage="MAX" />
                  </StyledButton>
                </StyledFormHelperText>
              )}
            </StyledTitleContainer>
            <StyledTokenInputContainer>
              <AggregatorTokenInput
                id="from-value"
                error={cantFund && account ? 'Amount cannot exceed balance' : ''}
                value={fromValueToUse}
                disabled={isLoadingRoute}
                onChange={handleFromValueChange}
                token={from}
                fullWidth
                usdValue={parseFloat(fromPrice?.toString() || fromFetchedPrice?.toFixed(2) || '0').toFixed(2)}
                onTokenSelect={() => startSelectingCoin(from || emptyTokenWithAddress('from'))}
              />
            </StyledTokenInputContainer>
          </StyledTokensContainer>
        </StyledContentContainer>
        <StyledToggleContainer>
          <StyledToggleTokenButton onClick={toggleFromTo}>
            <SwapVertIcon />
          </StyledToggleTokenButton>
        </StyledToggleContainer>
      </Grid>
      <Grid item xs={12} sx={{ paddingTop: '8px !important' }}>
        <StyledContentContainer>
          <StyledTokensContainer>
            <StyledTitleContainer>
              <Typography variant="body1">
                <FormattedMessage description="youReceive" defaultMessage="You receive" />
              </Typography>
            </StyledTitleContainer>
            <StyledTokenInputContainer>
              <AggregatorTokenInput
                id="to-value"
                value={toValueToUse}
                disabled={isLoadingRoute}
                onChange={handleToValueChange}
                token={to}
                fullWidth
                usdValue={parseFloat(toPrice?.toString() || toFetchedPrice?.toFixed(2) || '0').toFixed(2)}
                onTokenSelect={() => startSelectingCoin(to || emptyTokenWithAddress('to'))}
                impact={priceImpact}
              />
            </StyledTokenInputContainer>
          </StyledTokensContainer>
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>
          {transferTo && <TransferTo transferTo={transferTo} onOpenTransferTo={onOpenTransferTo} />}
          <QuoteSimulation
            tx={selectedRoute?.tx}
            cantFund={cantFund}
            isApproved={isApproved}
            isLoadingRoute={isLoadingRoute}
            setTransactionWillFail={setTransactionWillFail}
            forceProviderSimulation={!!transferTo}
          />
          <QuoteData quote={(!isLoadingRoute && selectedRoute) || null} to={to} />
          <StyledButtonContainer>
            {buttonToShow}
            {!transferTo && (
              <StyledIconButton variant="contained" color="secondary" size="small" onClick={onOpenTransferTo}>
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
                  <SendIcon fontSize="inherit" />
                </Tooltip>
              </StyledIconButton>
            )}
          </StyledButtonContainer>
        </StyledContentContainer>
      </Grid>
    </StyledGrid>
  );
});

export default SwapFirstStep;
