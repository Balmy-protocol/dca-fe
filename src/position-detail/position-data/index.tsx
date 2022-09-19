import React from 'react';
import { FullPosition, GetPairSwapsData, YieldOptions } from 'types';
import Typography from '@mui/material/Typography';
import TokenIcon from 'common/token-icon';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { BigNumber } from 'ethers';
import { emptyTokenWithAddress, formatCurrencyAmount } from 'utils/currency';
import Button from 'common/button';
import {
  activePositionsPerIntervalToHasToExecute,
  calculateStale,
  calculateYield,
  fullPositionToMappedPosition,
  getTimeFrequencyLabel,
  STALE,
} from 'utils/parsing';
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
import CustomChip from 'common/custom-chip';
import ComposedTokenIcon from 'common/composed-token-icon';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

interface DetailsProps {
  position: FullPosition;
  pair?: GetPairSwapsData;
  pendingTransaction: string | null;
  onWithdraw: (useProtocolToken: boolean) => void;
  onReusePosition: () => void;
  disabled: boolean;
  yieldOptions: YieldOptions;
  toWithdrawUnderlying?: BigNumber | null;
  remainingLiquidityUnderlying?: BigNumber | null;
  swappedUnderlying?: BigNumber | null;
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
  gap: 5px;
  flex-wrap: wrap;
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
  gap: 10px;
`;

const StyledCallToActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const Details = ({
  position,
  pair,
  pendingTransaction,
  onWithdraw,
  onReusePosition,
  disabled,
  yieldOptions,
  toWithdrawUnderlying,
  remainingLiquidityUnderlying,
  swappedUnderlying,
}: DetailsProps) => {
  const { from, to, swapInterval, remainingLiquidity: remainingLiquidityRaw, chainId } = position;

  const positionNetwork = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const supportedNetwork = find(NETWORKS, { chainId })!;
    return supportedNetwork;
  }, [chainId]);

  const {
    toWithdraw: rawToWithdraw,
    depositedRateUnderlying,
    rate: positionRate,
    remainingSwaps,
    totalSwaps,
    totalSwappedUnderlyingAccum,
    toWithdrawUnderlyingAccum,
    swapped: rawSwapped,
  } = fullPositionToMappedPosition(position);
  const web3Service = useWeb3Service();
  const account = web3Service.getAccount();
  const rate = depositedRateUnderlying || positionRate;
  const toWithdraw = toWithdrawUnderlying || rawToWithdraw;
  const toWithdrawYield =
    toWithdrawUnderlyingAccum && toWithdrawUnderlying
      ? toWithdrawUnderlying.sub(toWithdrawUnderlyingAccum)
      : BigNumber.from(0);
  const toWithdrawBase = toWithdraw.sub(toWithdrawYield);

  const swapped = swappedUnderlying || rawSwapped;
  const swappedYield =
    totalSwappedUnderlyingAccum && swappedUnderlying
      ? swappedUnderlying.sub(totalSwappedUnderlyingAccum)
      : BigNumber.from(0);
  const swappedBase = swapped.sub(swappedYield);

  const { yieldGenerated: yieldFromGenerated, base: remainingLiquidity } = calculateYield(
    remainingLiquidityUnderlying || BigNumber.from(remainingLiquidityRaw),
    rate,
    remainingSwaps
  );

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
    const swappedRate =
      position.pair.tokenA.address === tokenFromAverage.address
        ? BigNumber.from(action.ratioAToBWithFee)
        : BigNumber.from(action.ratioBToAWithFee);

    summedPrices = summedPrices.add(swappedRate);
  });
  const averageBuyPrice = summedPrices.gt(BigNumber.from(0))
    ? summedPrices.div(swappedActions.length)
    : BigNumber.from(0);
  const [fromPrice, isLoadingFromPrice] = useUsdPrice(position.from, BigNumber.from(remainingLiquidity));
  const [fromYieldPrice, isLoadingFromYieldPrice] = useUsdPrice(position.from, BigNumber.from(yieldFromGenerated));
  const [toPrice, isLoadingToPrice] = useUsdPrice(position.to, toWithdrawBase);
  const [toYieldPrice, isLoadingToYieldPrice] = useUsdPrice(position.to, toWithdrawYield);
  const [toFullPrice, isLoadingToFullPrice] = useUsdPrice(position.to, swappedBase);
  const [toYieldFullPrice, isLoadingToYieldFullPrice] = useUsdPrice(position.to, swappedYield);
  const showToFullPrice = !STABLE_COINS.includes(position.to.symbol) && !isLoadingToFullPrice && !!toFullPrice;
  const showToYieldFullPrice =
    !STABLE_COINS.includes(position.to.symbol) && !isLoadingToYieldFullPrice && !!toYieldFullPrice;
  const showToPrice = !STABLE_COINS.includes(position.to.symbol) && !isLoadingToPrice && !!toPrice;
  const showToYieldPrice = !STABLE_COINS.includes(position.to.symbol) && !isLoadingToYieldPrice && !!toYieldPrice;
  const showFromPrice = !STABLE_COINS.includes(position.from.symbol) && !isLoadingFromPrice && !!fromPrice;
  const showFromYieldPrice =
    !STABLE_COINS.includes(position.from.symbol) && !isLoadingFromYieldPrice && !!fromYieldPrice;
  const [hasSignSupport] = useSupportsSigning();

  const hasNoFunds = BigNumber.from(remainingLiquidity).lte(BigNumber.from(0));

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
      pair?.activePositionsPerInterval
        ? activePositionsPerIntervalToHasToExecute(pair?.activePositionsPerInterval)
        : null
    ) === STALE;

  const shouldDisableWithdraw = toWithdraw.lte(BigNumber.from(0));

  const isOwner = account && account.toLowerCase() === position.user.toLowerCase();

  const foundYieldFrom =
    position.from.underlyingTokens[0] &&
    find(yieldOptions, { tokenAddress: position.from.underlyingTokens[0].address });
  const foundYieldTo =
    position.to.underlyingTokens[0] && find(yieldOptions, { tokenAddress: position.to.underlyingTokens[0].address });

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
            <FormGroup row>
              <FormControlLabel
                labelPlacement="end"
                control={<Switch checked name="enableDisableWrappedProtocolToken" color="primary" size="small" />}
                label="Breakdown yield"
              />
            </FormGroup>
          </StyledDetailWrapper>
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
            <CustomChip
              extraText={showToFullPrice && `(${toFullPrice.toFixed(2)} USD)`}
              icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={position.to} />}
            >
              <Typography variant="body2">
                {formatCurrencyAmount(BigNumber.from(swappedBase), position.to, 4)}
              </Typography>
            </CustomChip>
            {swappedYield.gt(BigNumber.from(0)) && (
              <>
                +
                {/* <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
                  <FormattedMessage description="plusYield" defaultMessage="+ yield" />
                </Typography> */}
                <CustomChip
                  icon={
                    <ComposedTokenIcon
                      isInChip
                      size="16px"
                      tokenTop={foundYieldFrom?.token}
                      tokenBottom={position.to}
                    />
                  }
                  extraText={showToYieldFullPrice && `(${toYieldFullPrice.toFixed(2)} USD)`}
                >
                  <Typography variant="body2">{formatCurrencyAmount(swappedYield, position.to, 4)}</Typography>
                </CustomChip>
              </>
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
            <CustomChip icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={position.from} />}>
              <Typography variant="body2">{formatCurrencyAmount(BigNumber.from(rate), position.from, 4)}</Typography>
            </CustomChip>
            <FormattedMessage
              description="positionDetailsCurrentRate"
              defaultMessage="{frequency} {hasYield}"
              values={{
                b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                hasYield: position.from.underlyingTokens.length ? '+ yield' : '',
                frequency:
                  STRING_SWAP_INTERVALS[position.swapInterval.interval as keyof typeof STRING_SWAP_INTERVALS].every,
              }}
            />
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
              <CustomChip
                extraText={showFromPrice && `(${fromPrice.toFixed(2)} USD)`}
                icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={position.from} />}
              >
                <Typography variant="body2">
                  {formatCurrencyAmount(BigNumber.from(remainingLiquidity), position.from, 4)}
                </Typography>
              </CustomChip>
              {yieldFromGenerated.gt(BigNumber.from(0)) && (
                <>
                  +
                  {/* <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
                    <FormattedMessage description="plusYield" defaultMessage="+ yield" />
                  </Typography> */}
                  <CustomChip
                    icon={
                      <ComposedTokenIcon
                        isInChip
                        size="16px"
                        tokenTop={foundYieldFrom?.token}
                        tokenBottom={position.from}
                      />
                    }
                    extraText={showFromYieldPrice && `(${fromYieldPrice.toFixed(2)} USD)`}
                  >
                    <Typography variant="body2">
                      {formatCurrencyAmount(BigNumber.from(yieldFromGenerated), position.from, 4)}
                    </Typography>
                  </CustomChip>
                </>
              )}
            </StyledDetailWrapper>
          )}
          {position.status !== 'TERMINATED' && (
            <StyledDetailWrapper>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                <FormattedMessage description="positionDetailsToWithdrawTitle" defaultMessage="To withdraw: " />
              </Typography>
              <CustomChip
                extraText={showToPrice && `(${toPrice.toFixed(2)} USD)`}
                icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={position.to} />}
              >
                <Typography variant="body2">
                  {formatCurrencyAmount(BigNumber.from(toWithdrawBase), position.to, 4)}
                </Typography>
              </CustomChip>
              {toWithdrawYield.gt(BigNumber.from(0)) && (
                <>
                  +
                  {/* <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
                    <FormattedMessage description="plusYield" defaultMessage="+ yield" />
                  </Typography> */}
                  <CustomChip
                    icon={
                      <ComposedTokenIcon
                        isInChip
                        size="16px"
                        tokenTop={foundYieldTo?.token}
                        tokenBottom={position.to}
                      />
                    }
                    extraText={showToYieldPrice && `(${toYieldPrice.toFixed(2)} USD)`}
                  >
                    <Typography variant="body2">{formatCurrencyAmount(toWithdrawYield, position.to, 4)}</Typography>
                  </CustomChip>
                </>
              )}
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
                    average: formatCurrencyAmount(averageBuyPrice, tokenToAverage, 4),
                    currencySymbol: STABLE_COINS.includes(tokenToAverage.symbol) ? '$' : '',
                  }}
                />
              ) : (
                <FormattedMessage description="positionDetailsAverageBuyPriceNotSwap" defaultMessage="No swaps yet" />
              )}
            </Typography>
          </StyledDetailWrapper>
          {foundYieldFrom && (
            <StyledDetailWrapper>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                <FormattedMessage
                  description="positionDetailsYieldFromTitle"
                  defaultMessage="{from} yield:"
                  values={{ from: position.from.symbol }}
                />
              </Typography>
              <CustomChip icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={foundYieldFrom.token} />}>
                <Typography variant="body2" fontWeight={500}>
                  APY {foundYieldFrom.apy.toFixed(0)}%
                </Typography>
              </CustomChip>
            </StyledDetailWrapper>
          )}
          {foundYieldTo && (
            <StyledDetailWrapper>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                <FormattedMessage
                  description="positionDetailsYieldFromTitle"
                  defaultMessage="{to} yield:"
                  values={{ to: position.to.symbol }}
                />
              </Typography>
              <CustomChip icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={foundYieldTo.token} />}>
                <Typography variant="body2" fontWeight={500}>
                  APY {foundYieldTo.apy.toFixed(0)}%
                </Typography>
              </CustomChip>
            </StyledDetailWrapper>
          )}
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
