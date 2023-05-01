import React from 'react';
import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import isUndefined from 'lodash/isUndefined';
import isEqual from 'lodash/isEqual';
import Button from '@common/components/button';
import { SwapOption, Token } from '@types';
import Typography from '@mui/material/Typography';
import { defineMessage, FormattedMessage } from 'react-intl';
import { emptyTokenWithAddress, formatCurrencyAmount, toToken } from '@common/utils/currency';
import Tooltip from '@mui/material/Tooltip';
import { BigNumber } from 'ethers';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import SearchIcon from '@mui/icons-material/Search';
import { Alert, InputAdornment, ListSubheader, MenuItem, Select, TextField } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { DEFAULT_AGGREGATOR_SETTINGS, GasKeys } from '@constants/aggregator';
import Badge from '@mui/material/Badge';
import FormHelperText from '@mui/material/FormHelperText';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { formatUnits, parseUnits } from '@ethersproject/units';
import useUsdPrice from '@hooks/useUsdPrice';
import find from 'lodash/find';
import TokenIcon from '@common/components/token-icon';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import {
  getGhTokenListLogoUrl,
  getMaxDeduction,
  getMinAmountForMaxDeduction,
  NETWORKS,
  REMOVED_AGG_CHAINS,
} from '@constants';
import { getAllChains } from '@mean-finance/sdk';
import useSdkChains from '@hooks/useSdkChains';
import useAccount from '@hooks/useAccount';
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

  :disabled {
    background-color: #292929;
  }

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

  const [chainSearch, setChainSearch] = React.useState('');
  const chainSearchRef = React.useRef<HTMLDivElement>();

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

  const [fromFetchedPrice, isLoadingFromPrice] = useUsdPrice(
    from,
    parseUnits(fromValueToUse || '0', selectedRoute?.sellToken.decimals || from?.decimals),
    undefined,
    selectedNetwork.chainId
  );
  const [toFetchedPrice, isLoadingToPrice] = useUsdPrice(
    to,
    parseUnits(toValueToUse || '0', selectedRoute?.buyToken.decimals || to?.decimals),
    undefined,
    selectedNetwork.chainId
  );
  const supportedChains = useSdkChains();
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

  const onSetMaxBalance = () => {
    if (balance && from) {
      if (from.address === PROTOCOL_TOKEN_ADDRESS) {
        const maxValue = balance.gte(getMinAmountForMaxDeduction(currentNetwork.chainId))
          ? balance.sub(getMaxDeduction(currentNetwork.chainId))
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
    !isEqual(disabledDexes, DEFAULT_AGGREGATOR_SETTINGS.disabledDexes);

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

  const mappedNetworks = React.useMemo(
    () =>
      supportedChains
        .map((networkId) => {
          const foundSdkNetwork = find(
            getAllChains().filter((chain) => !chain.testnet),
            { chainId: networkId }
          );
          const foundNetwork = find(NETWORKS, { chainId: networkId });

          if (!foundSdkNetwork) {
            return null;
          }

          return {
            ...foundSdkNetwork,
            ...(foundNetwork || {}),
          };
        })
        .filter(
          (network) =>
            !REMOVED_AGG_CHAINS.includes(network?.chainId || -1) &&
            network?.name.toLowerCase().includes(chainSearch.toLowerCase())
        ),
    [supportedChains, chainSearch]
  );

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
                onChange={(evt) => {
                  onChangeNetwork(Number(evt.target.value));
                  setChainSearch('');
                }}
                onClose={() => setChainSearch('')}
                size="small"
                SelectDisplayProps={{ style: { display: 'flex', alignItems: 'center', gap: '5px' } }}
                MenuProps={{
                  autoFocus: false,
                  TransitionProps: { onEntered: () => chainSearchRef.current?.focus() },
                  transformOrigin: {
                    horizontal: 'center',
                    vertical: 'top',
                  },
                }}
              >
                <ListSubheader sx={{ backgroundColor: '#1e1e1e' }}>
                  <TextField
                    size="small"
                    // Autofocus on textfield
                    autoFocus
                    placeholder="Type to search..."
                    fullWidth
                    value={chainSearch}
                    inputRef={chainSearchRef}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    onChange={(e) => setChainSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Escape') {
                        // Prevents autoselecting item while typing (default Select behaviour)
                        e.stopPropagation();
                      }
                    }}
                  />
                </ListSubheader>
                {mappedNetworks.map((network) => {
                  if (!network) {
                    return null;
                  }

                  return (
                    <MenuItem sx={{ display: 'flex', alignItems: 'center', gap: '5px' }} value={network.chainId}>
                      <TokenIcon
                        size="20px"
                        token={toToken({
                          address: network.mainCurrency || network.wToken,
                          chainId: network.chainId,
                          logoURI: getGhTokenListLogoUrl(network.chainId, 'logo'),
                        })}
                      />
                      {network.name}
                    </MenuItem>
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
                  <StyledButton onClick={onSetMaxBalance} disabled={isLoadingRoute} color="secondary" variant="text">
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
                isLoadingPrice={isLoadingFromPrice}
                usdValue={
                  (!isUndefined(fromPriceToShow) && parseFloat(fromPriceToShow.toFixed(2)).toFixed(2)) || undefined
                }
                onTokenSelect={() => startSelectingCoin(from || emptyTokenWithAddress('from'))}
              />
            </StyledTokenInputContainer>
          </StyledTokensContainer>
        </StyledContentContainer>
        <StyledToggleContainer>
          <StyledToggleTokenButton onClick={toggleFromTo} disabled={isLoadingRoute}>
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
                isLoadingPrice={isLoadingToPrice}
                usdValue={(!isUndefined(toPriceToShow) && parseFloat(toPriceToShow.toFixed(2)).toFixed(2)) || undefined}
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
                      ? defineMessage({
                          defaultMessage: ' and ',
                          description: 'andWithSpaces',
                        })
                      : '',
                }}
              />
            </Alert>
          )}
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
