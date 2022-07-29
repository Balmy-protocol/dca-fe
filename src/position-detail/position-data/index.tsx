import React from 'react';
import { FullPosition, GetPairSwapsData } from 'types';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import TokenIcon from 'common/token-icon';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { BigNumber } from 'ethers';
import { emptyTokenWithAddress, formatCurrencyAmount } from 'utils/currency';
import Button from 'common/button';
import { calculateStale, fullPositionToMappedPosition, getTimeFrequencyLabel, STALE } from 'utils/parsing';
import { NETWORKS, POSITION_ACTIONS, STABLE_COINS, STRING_SWAP_INTERVALS } from 'config/constants';
import useUsdPrice from 'hooks/useUsdPrice';
import LinearProgress from '@mui/material/LinearProgress';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { createStyles } from '@mui/material/styles';
import { withStyles } from '@mui/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { getProtocolToken, getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import useWeb3Service from 'hooks/useWeb3Service';
import Link from '@mui/material/Link';
import { buildEtherscanTransaction } from 'utils/etherscan';
import useSupportsSigning from 'hooks/useSupportsSigning';
import find from 'lodash/find';
import useWalletService from 'hooks/useWalletService';

interface DetailsProps {
  position: FullPosition;
  pair?: GetPairSwapsData;
  pendingTransaction: string | null;
  onWithdraw: (useProtocolToken: boolean) => void;
  onReusePosition: () => void;
  disabled: boolean;
}

const StyledSwapsLinearProgress = styled(LinearProgress)<{ swaps: number }>``;

const BorderLinearProgress = withStyles(() =>
  createStyles({
    root: {
      height: 8,
      borderRadius: 10,
      background: '#D8D8D8',
    },
    bar: {
      borderRadius: 10,
      background: 'linear-gradient(90deg, #3076F6 0%, #B518FF 123.4%)',
    },
  })
)(StyledSwapsLinearProgress);

const StyledNetworkLogoContainer = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  border-radius: 30px;
  border: 3px solid #1b1923;
  width: 32px;
  height: 32px;
`;

const StyledChip = styled(Chip)`
  margin: 0px 5px;
`;

const StyledCard = styled(Card)`
  border-radius: 10px;
  position: relative;
  display: flex;
  flex-grow: 1;
  background: #292929;
  overflow: visible;
`;

const StyledCardContent = styled(CardContent)`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`;

const StyledCardHeader = styled.div`
  display: flex;
  margin-bottom: 5px;
  flex-wrap: wrap;
`;

const StyledArrowRightContainer = styled.div`
  margin: 0 5px !important;
  font-size: 35px;
  display: flex;
`;

const StyledCardTitleHeader = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
  flex-grow: 1;
  *:not(:first-child) {
    margin-left: 4px;
    font-weight: 500;
  }
`;

const StyledDetailWrapper = styled.div`
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const StyledProgressWrapper = styled.div`
  margin: 12px 0px;
`;

const StyledCardFooterButton = styled(Button)`
  margin-top: 8px;
`;

const StyledFreqLeft = styled.div`
  display: flex;
  align-items: center;
  text-transform: uppercase;
`;

const StyledStale = styled.div`
  color: #cc6d00;
  display: flex;
  align-items: center;
  text-transform: uppercase;
`;

const StyledFinished = styled.div`
  color: #33ac2e;
  display: flex;
  align-items: center;
  text-transform: uppercase;
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const StyledCallToActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const Details = ({ position, pair, pendingTransaction, onWithdraw, onReusePosition, disabled }: DetailsProps) => {
  const { from, to, swapInterval, current, chainId } = position;

  const positionNetwork = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const supportedNetwork = find(NETWORKS, { chainId })!;
    return supportedNetwork;
  }, [chainId]);

  const { toWithdraw, remainingLiquidity, remainingSwaps, totalSwaps } = fullPositionToMappedPosition(position);
  const web3Service = useWeb3Service();
  const account = web3Service.getAccount();

  const currentNetwork = useCurrentNetwork();
  const protocolToken = getProtocolToken(currentNetwork.chainId);
  const walletService = useWalletService();
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const isPending = pendingTransaction !== null;
  const swappedActions = position.history.filter((history) => history.action === POSITION_ACTIONS.SWAPPED);
  let summedPrices = BigNumber.from(0);
  let tokenFromAverage = STABLE_COINS.includes(position.to.symbol) ? position.from : position.to;
  let tokenToAverage = STABLE_COINS.includes(position.to.symbol) ? position.to : position.from;
  tokenFromAverage =
    tokenFromAverage.address === PROTOCOL_TOKEN_ADDRESS
      ? { ...wrappedProtocolToken, symbol: tokenFromAverage.symbol }
      : tokenFromAverage;
  tokenToAverage =
    tokenToAverage.address === PROTOCOL_TOKEN_ADDRESS
      ? { ...wrappedProtocolToken, symbol: tokenFromAverage.symbol }
      : tokenToAverage;
  swappedActions.forEach((action) => {
    const rate =
      position.pair.tokenA.address === tokenFromAverage.address
        ? BigNumber.from(action.ratePerUnitAToBWithFee)
        : BigNumber.from(action.ratePerUnitBToAWithFee);

    summedPrices = summedPrices.add(rate);
  });
  const averageBuyPrice = summedPrices.gt(BigNumber.from(0))
    ? summedPrices.div(swappedActions.length)
    : BigNumber.from(0);
  const [fromPrice, isLoadingFromPrice] = useUsdPrice(
    position.from,
    BigNumber.from(position.current.remainingLiquidity)
  );
  const [toPrice, isLoadingToPrice] = useUsdPrice(position.to, BigNumber.from(position.current.idleSwapped));
  const [toFullPrice, isLoadingToFullPrice] = useUsdPrice(position.to, BigNumber.from(position.totalSwapped));
  const showToFullPrice = !STABLE_COINS.includes(position.to.symbol) && !isLoadingToFullPrice && !!toFullPrice;
  const showToPrice = !STABLE_COINS.includes(position.to.symbol) && !isLoadingToPrice && !!toPrice;
  const showFromPrice = !STABLE_COINS.includes(position.from.symbol) && !isLoadingFromPrice && !!fromPrice;
  const [hasSignSupport] = useSupportsSigning();

  const hasNoFunds = BigNumber.from(current.remainingLiquidity).lte(BigNumber.from(0));

  const lastExecutedAt = (pair?.swaps && pair?.swaps[0] && pair?.swaps[0].executedAtTimestamp) || '0';

  const onChangeNetwork = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetwork(chainId);
  };

  const isStale =
    calculateStale(
      parseInt(lastExecutedAt, 10) || 0,
      BigNumber.from(position.swapInterval.interval),
      parseInt(position.createdAtTimestamp, 10) || 0,
      pair?.nextSwapAvailableAt ?? null
    ) === STALE;

  const shouldDisableWithdraw = toWithdraw.lte(BigNumber.from(0));

  const isOwner = account && account.toLowerCase() === position.user.toLowerCase();
  return (
    <StyledCard>
      {positionNetwork && (
        <StyledNetworkLogoContainer>
          <TokenIcon size="26px" token={emptyTokenWithAddress(positionNetwork.mainCurrency || '')} />
        </StyledNetworkLogoContainer>
      )}
      <StyledCardContent>
        <StyledContentContainer>
          <StyledCardHeader>
            <StyledCardTitleHeader>
              <TokenIcon token={from} size="27px" />
              <Typography variant="body1">{from.symbol}</Typography>
              <StyledArrowRightContainer>
                <ArrowRightAltIcon fontSize="inherit" />
              </StyledArrowRightContainer>
              <TokenIcon token={to} size="27px" />
              <Typography variant="body1">{to.symbol}</Typography>
            </StyledCardTitleHeader>
            {!isPending && !hasNoFunds && !isStale && (
              <StyledFreqLeft>
                <Typography variant="caption">
                  <FormattedMessage
                    description="days to finish"
                    defaultMessage="{type} left"
                    values={{
                      type: getTimeFrequencyLabel(swapInterval.interval, remainingSwaps.toString()),
                    }}
                  />
                </Typography>
              </StyledFreqLeft>
            )}
            {!isPending && hasNoFunds && position.status === 'TERMINATED' && (
              <StyledStale>
                <Typography variant="caption">
                  <FormattedMessage description="finishedPosition" defaultMessage="TERMINATED" />
                </Typography>
              </StyledStale>
            )}
            {!isPending && hasNoFunds && position.status !== 'TERMINATED' && (
              <StyledFinished>
                <Typography variant="caption">
                  <FormattedMessage description="finishedPosition" defaultMessage="FINISHED" />
                </Typography>
              </StyledFinished>
            )}
            {!isPending && !hasNoFunds && position.status !== 'TERMINATED' && isStale && (
              <StyledStale>
                <Typography variant="caption">
                  <FormattedMessage description="stale" defaultMessage="STALE" />
                </Typography>
              </StyledStale>
            )}
          </StyledCardHeader>
          <StyledProgressWrapper>
            {remainingSwaps.toNumber() > 0 && (
              <BorderLinearProgress
                swaps={remainingSwaps.toNumber()}
                variant="determinate"
                value={100 * ((totalSwaps.toNumber() - remainingSwaps.toNumber()) / totalSwaps.toNumber())}
              />
            )}
          </StyledProgressWrapper>
          <StyledDetailWrapper>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
              <FormattedMessage
                description="swappedTo"
                defaultMessage="Swapped:"
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                }}
              />
            </Typography>
            <Typography
              variant="body1"
              color={
                BigNumber.from(position.totalSwapped).gt(BigNumber.from(0)) ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'
              }
              sx={{ marginLeft: '5px' }}
            >
              <FormattedMessage
                description="positionDetailsHistoricallySwapped"
                defaultMessage="{swapped} {to}"
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                  swapped: formatCurrencyAmount(BigNumber.from(position.totalSwapped), position.to),
                  to: position.to.symbol,
                }}
              />
            </Typography>
            {showToFullPrice && (
              <StyledChip
                size="small"
                variant="outlined"
                label={
                  <FormattedMessage
                    description="current remaining price"
                    defaultMessage="({toPrice} USD)"
                    values={{
                      b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                      toPrice: toFullPrice?.toFixed(2),
                    }}
                  />
                }
              />
            )}
          </StyledDetailWrapper>
          <StyledDetailWrapper>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
              <FormattedMessage
                description="current remaining"
                defaultMessage="Rate:"
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                }}
              />
            </Typography>
            <Typography
              variant="body1"
              color={
                BigNumber.from(position.current.rate).gt(BigNumber.from(0)) ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'
              }
              sx={{ marginLeft: '5px' }}
            >
              <FormattedMessage
                description="positionDetailsCurrentRate"
                defaultMessage="{rate} {from} {frequency}"
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                  rate: formatCurrencyAmount(BigNumber.from(position.current.rate), position.from),
                  from: position.from.symbol,
                  frequency:
                    STRING_SWAP_INTERVALS[position.swapInterval.interval as keyof typeof STRING_SWAP_INTERVALS].every,
                }}
              />
            </Typography>
          </StyledDetailWrapper>
          {position.status !== 'TERMINATED' && (
            <StyledDetailWrapper>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                <FormattedMessage
                  description="positionDetailsRemainingFundsTitle"
                  defaultMessage="Remaining:"
                  values={{
                    b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                  }}
                />
              </Typography>
              <Typography
                variant="body1"
                color={remainingLiquidity.gt(BigNumber.from(0)) ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}
                sx={{ marginLeft: '5px' }}
              >
                <FormattedMessage
                  description="positionDetailsRemainingFunds"
                  defaultMessage="{funds} {from}"
                  values={{
                    b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                    funds: formatCurrencyAmount(BigNumber.from(position.current.remainingLiquidity), position.from),
                    from: position.from.symbol,
                  }}
                />
              </Typography>
              {showFromPrice && (
                <StyledChip
                  size="small"
                  variant="outlined"
                  label={
                    <FormattedMessage
                      description="current remaining price"
                      defaultMessage="({toPrice} USD)"
                      values={{
                        b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                        toPrice: fromPrice?.toFixed(2),
                      }}
                    />
                  }
                />
              )}
            </StyledDetailWrapper>
          )}
          {position.status !== 'TERMINATED' && (
            <StyledDetailWrapper>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                <FormattedMessage description="positionDetailsToWithdrawTitle" defaultMessage="To withdraw: " />
              </Typography>
              <Typography
                variant="body1"
                color={toWithdraw.gt(BigNumber.from(0)) ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}
                sx={{ marginLeft: '5px' }}
              >
                {`${formatCurrencyAmount(toWithdraw, to)} ${to.symbol}`}
              </Typography>
              <Typography variant="body1">
                {showToPrice && (
                  <StyledChip
                    size="small"
                    variant="outlined"
                    label={
                      <FormattedMessage
                        description="current swapped in position price"
                        defaultMessage="({toPrice} USD)"
                        values={{
                          b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                          toPrice: toPrice?.toFixed(2),
                        }}
                      />
                    }
                  />
                )}
              </Typography>
            </StyledDetailWrapper>
          )}
          <StyledDetailWrapper>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
              <FormattedMessage description="positionDetailsAverageBuyPriceTitle" defaultMessage="Average buy price:" />
            </Typography>
            <Typography
              variant="body1"
              color={averageBuyPrice.gt(BigNumber.from(0)) ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}
              sx={{ marginLeft: '5px' }}
            >
              {averageBuyPrice.gt(BigNumber.from(0)) ? (
                <FormattedMessage
                  description="positionDetailsAverageBuyPrice"
                  defaultMessage="1 {from} = {currencySymbol}{average} {to}"
                  values={{
                    b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                    from: tokenFromAverage.symbol,
                    to: STABLE_COINS.includes(tokenToAverage.symbol) ? 'USD' : tokenToAverage.symbol,
                    average: formatCurrencyAmount(averageBuyPrice, tokenToAverage),
                    currencySymbol: STABLE_COINS.includes(tokenToAverage.symbol) ? '$' : '',
                  }}
                />
              ) : (
                <FormattedMessage description="positionDetailsAverageBuyPriceNotSwap" defaultMessage="No swaps yet" />
              )}
            </Typography>
          </StyledDetailWrapper>
        </StyledContentContainer>
        {isOwner && position.status !== 'TERMINATED' && (
          <StyledCallToActionContainer>
            {isPending && pendingTransaction && (
              <StyledCardFooterButton variant="contained" color="pending" fullWidth>
                <Link
                  href={buildEtherscanTransaction(pendingTransaction, positionNetwork.chainId)}
                  target="_blank"
                  rel="noreferrer"
                  underline="none"
                  color="inherit"
                >
                  <Typography variant="body2" component="span">
                    <FormattedMessage description="pending transaction" defaultMessage="Pending transaction" />
                  </Typography>
                  <OpenInNewIcon style={{ fontSize: '1rem' }} />
                </Link>
              </StyledCardFooterButton>
            )}
            {!isPending && (
              <>
                {disabled && (
                  <StyledCardFooterButton
                    size="large"
                    color="secondary"
                    variant="contained"
                    onClick={onChangeNetwork}
                    fullWidth
                  >
                    <Typography variant="body2">
                      <FormattedMessage
                        description="incorrect network"
                        defaultMessage="Change network to {network}"
                        values={{ network: positionNetwork.name }}
                      />
                    </Typography>
                  </StyledCardFooterButton>
                )}
                {!disabled &&
                  (toWithdraw.gt(BigNumber.from(0)) ||
                    (toWithdraw.lte(BigNumber.from(0)) && remainingSwaps.gt(BigNumber.from(0)))) &&
                  position.to.address === PROTOCOL_TOKEN_ADDRESS &&
                  hasSignSupport && (
                    <StyledCardFooterButton
                      disabled={shouldDisableWithdraw || disabled}
                      variant="contained"
                      color="secondary"
                      onClick={() => onWithdraw(true)}
                      fullWidth
                    >
                      <Typography variant="body2">
                        <FormattedMessage
                          description="withdraw"
                          defaultMessage="Withdraw {protocolToken}"
                          values={{ protocolToken: protocolToken.symbol }}
                        />
                      </Typography>
                    </StyledCardFooterButton>
                  )}
                {!disabled &&
                  (toWithdraw.gt(BigNumber.from(0)) ||
                    (toWithdraw.lte(BigNumber.from(0)) && remainingSwaps.gt(BigNumber.from(0)))) && (
                    <StyledCardFooterButton
                      disabled={shouldDisableWithdraw || disabled}
                      variant="contained"
                      color="secondary"
                      onClick={() => onWithdraw(false)}
                      fullWidth
                    >
                      <Typography variant="body2">
                        <FormattedMessage
                          description="withdraw"
                          defaultMessage="Withdraw {wrappedProtocolToken}"
                          values={{
                            wrappedProtocolToken:
                              position.to.address === PROTOCOL_TOKEN_ADDRESS && hasSignSupport
                                ? wrappedProtocolToken.symbol
                                : '',
                          }}
                        />
                      </Typography>
                    </StyledCardFooterButton>
                  )}
                {!disabled &&
                  position.status !== 'TERMINATED' &&
                  toWithdraw.lte(BigNumber.from(0)) &&
                  remainingSwaps.eq(BigNumber.from(0)) && (
                    <StyledCardFooterButton
                      variant="contained"
                      color="secondary"
                      onClick={() => onReusePosition()}
                      fullWidth
                      disabled={disabled}
                    >
                      <Typography variant="body2">
                        <FormattedMessage description="reusePosition" defaultMessage="Reuse position" />
                      </Typography>
                    </StyledCardFooterButton>
                  )}
              </>
            )}
          </StyledCallToActionContainer>
        )}
      </StyledCardContent>
    </StyledCard>
  );
};
export default Details;
