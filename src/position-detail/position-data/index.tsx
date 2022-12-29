import React from 'react';
import { FullPosition, GetPairSwapsData, YieldOptions } from 'types';
import Typography from '@mui/material/Typography';
import TokenIcon from 'common/token-icon';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { BigNumber } from 'ethers';
import { emptyTokenWithAddress, formatCurrencyAmount } from 'utils/currency';
import {
  activePositionsPerIntervalToHasToExecute,
  calculateStale,
  calculateYield,
  fullPositionToMappedPosition,
  getTimeFrequencyLabel,
  STALE,
} from 'utils/parsing';
import {
  NETWORKS,
  POSITION_ACTIONS,
  STABLE_COINS,
  STRING_SWAP_INTERVALS,
  VERSIONS_ALLOWED_MODIFY,
} from 'config/constants';
import useUsdPrice from 'hooks/useUsdPrice';
import LinearProgress from '@mui/material/LinearProgress';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { createStyles } from '@mui/material/styles';
import { withStyles } from '@mui/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import find from 'lodash/find';
import CustomChip from 'common/custom-chip';
import ComposedTokenIcon from 'common/composed-token-icon';
import { useShowBreakdown } from 'state/position-details/hooks';
import { useAppDispatch } from 'state/hooks';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { updateShowBreakdown } from 'state/position-details/actions';
import { Theme, Tooltip } from '@mui/material';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import PositionDataControls from './position-data-controls';

const DarkTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))(Tooltip);

interface DetailsProps {
  position: FullPosition;
  pair?: GetPairSwapsData;
  onMigrateYield: () => void;
  onSuggestMigrateYield: () => void;
  pendingTransaction: string | null;
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

const StyledDeprecated = styled.div`
  color: #cc6d00;
  display: flex;
  align-items: center;
  text-transform: uppercase;
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

const StyledBreakdownLeft = styled.div`
  display: flex;
  align-items: center;
`;

const StyledFreqLeft = styled.div`
  display: flex;
  align-items: center;
  text-transform: uppercase;
  gap: 5px;
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

const Details = ({
  position,
  pair,
  pendingTransaction,
  onReusePosition,
  disabled,
  yieldOptions,
  toWithdrawUnderlying,
  remainingLiquidityUnderlying,
  swappedUnderlying,
  onMigrateYield,
  onSuggestMigrateYield,
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
  const rate = depositedRateUnderlying || positionRate;
  const showBreakdown = useShowBreakdown();
  const dispatch = useAppDispatch();
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

  const {
    total: totalRemainingLiquidity,
    yieldGenerated: yieldFromGenerated,
    base: remainingLiquidity,
  } = calculateYield(remainingLiquidityUnderlying || BigNumber.from(remainingLiquidityRaw), rate, remainingSwaps);

  const isPending = pendingTransaction !== null;
  const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);
  const swappedActions = position.history.filter((history) => history.action === POSITION_ACTIONS.SWAPPED);
  let summedPrices = BigNumber.from(0);
  let tokenFromAverage = STABLE_COINS.includes(position.to.symbol) ? position.from : position.to;
  let tokenToAverage = STABLE_COINS.includes(position.to.symbol) ? position.to : position.from;
  tokenFromAverage =
    tokenFromAverage.address === PROTOCOL_TOKEN_ADDRESS
      ? {
          ...wrappedProtocolToken,
          symbol: tokenFromAverage.symbol,
          underlyingTokens: tokenFromAverage.underlyingTokens,
        }
      : tokenFromAverage;
  tokenToAverage =
    tokenToAverage.address === PROTOCOL_TOKEN_ADDRESS
      ? { ...wrappedProtocolToken, symbol: tokenToAverage.symbol, underlyingTokens: tokenToAverage.underlyingTokens }
      : tokenToAverage;
  swappedActions.forEach((action) => {
    const swappedRate =
      position.pair.tokenA.address ===
      ((tokenFromAverage.underlyingTokens[0] && tokenFromAverage.underlyingTokens[0].address) ||
        tokenFromAverage.address)
        ? BigNumber.from(action.pairSwap.ratioUnderlyingAToB)
        : BigNumber.from(action.pairSwap.ratioUnderlyingBToA);

    summedPrices = summedPrices.add(swappedRate);
  });
  const averageBuyPrice = summedPrices.gt(BigNumber.from(0))
    ? summedPrices.div(swappedActions.length)
    : BigNumber.from(0);

  const [fromPrice, isLoadingFromPrice] = useUsdPrice(
    position.from,
    BigNumber.from(remainingLiquidity),
    undefined,
    chainId
  );
  const [fromYieldPrice, isLoadingFromYieldPrice] = useUsdPrice(
    position.from,
    BigNumber.from(yieldFromGenerated),
    undefined,
    chainId
  );
  const [ratePrice, isLoadingRatePrice] = useUsdPrice(position.from, rate, undefined, chainId);
  const [toPrice, isLoadingToPrice] = useUsdPrice(position.to, toWithdrawBase, undefined, chainId);
  const [toYieldPrice, isLoadingToYieldPrice] = useUsdPrice(position.to, toWithdrawYield, undefined, chainId);
  const [toFullPrice, isLoadingToFullPrice] = useUsdPrice(position.to, swappedBase, undefined, chainId);
  const [toYieldFullPrice, isLoadingToYieldFullPrice] = useUsdPrice(position.to, swappedYield, undefined, chainId);
  const showToFullPrice = !isLoadingToFullPrice && !!toFullPrice;
  const showToYieldFullPrice = !isLoadingToYieldFullPrice && !!toYieldFullPrice;
  const showToPrice = !isLoadingToPrice && !!toPrice;
  const showToYieldPrice = !isLoadingToYieldPrice && !!toYieldPrice;
  const showRatePrice = !isLoadingRatePrice && !!ratePrice;
  const showFromPrice = !isLoadingFromPrice && !!fromPrice;
  const showFromYieldPrice = !isLoadingFromYieldPrice && !!fromYieldPrice;

  const hasNoFunds = BigNumber.from(remainingLiquidity).lte(BigNumber.from(0));

  const lastExecutedAt = (pair?.swaps && pair?.swaps[0] && pair?.swaps[0].executedAtTimestamp) || '0';

  const isStale =
    calculateStale(
      parseInt(lastExecutedAt, 10) || 0,
      BigNumber.from(position.swapInterval.interval),
      parseInt(position.createdAtTimestamp, 10) || 0,
      pair?.activePositionsPerInterval
        ? activePositionsPerIntervalToHasToExecute(pair?.activePositionsPerInterval)
        : null
    ) === STALE;

  const foundYieldFrom =
    position.from.underlyingTokens[0] &&
    find(yieldOptions, { tokenAddress: position.from.underlyingTokens[0].address });
  const foundYieldTo =
    position.to.underlyingTokens[0] && find(yieldOptions, { tokenAddress: position.to.underlyingTokens[0].address });

  const toWithdrawToShow = showBreakdown ? toWithdrawBase : toWithdrawUnderlying;
  const swappedToShow = showBreakdown ? swappedBase : swappedUnderlying;
  const remainingLiquidityToShow = showBreakdown ? remainingLiquidity : totalRemainingLiquidity;

  const executedSwaps = totalSwaps.toNumber() - remainingSwaps.toNumber();

  const isOldVersion = !VERSIONS_ALLOWED_MODIFY.includes(position.version);

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
            {(foundYieldFrom || foundYieldTo) && (
              <StyledBreakdownLeft>
                <Typography variant="body2">
                  <FormGroup row>
                    <FormControlLabel
                      labelPlacement="start"
                      control={
                        <Switch
                          checked={showBreakdown}
                          onChange={() => dispatch(updateShowBreakdown(!showBreakdown))}
                          name="enableDisableShowBreakdown"
                          color="primary"
                        />
                      }
                      disableTypography
                      label="Detailed view:"
                    />
                  </FormGroup>
                </Typography>
              </StyledBreakdownLeft>
            )}
          </StyledCardHeader>
          {remainingSwaps.toNumber() > 0 && (
            <DarkTooltip
              title={
                <FormattedMessage
                  description="executedSwapsTooltip"
                  defaultMessage="Executed {executedSwaps}/{totalSwaps} swaps"
                  values={{
                    executedSwaps: position.totalExecutedSwaps.toString(),
                    totalSwaps: position.totalSwaps.toString(),
                  }}
                />
              }
              arrow
              placement="top"
            >
              <StyledProgressWrapper>
                <BorderLinearProgress
                  swaps={remainingSwaps.toNumber()}
                  variant="determinate"
                  value={100 * (executedSwaps / totalSwaps.toNumber())}
                />
              </StyledProgressWrapper>
            </DarkTooltip>
          )}
          <StyledDetailWrapper>
            {!isPending && !hasNoFunds && !isStale && !isOldVersion && (
              <StyledFreqLeft>
                <Typography variant="body1" color="rgba(255, 255, 255, 0.5)" textTransform="none">
                  <FormattedMessage description="positionDetailsRemainingTimeTitle" defaultMessage="Time left:" />
                </Typography>
                <Typography variant="body2">
                  <FormattedMessage
                    description="days to finish"
                    defaultMessage="{type} left"
                    values={{
                      type: getTimeFrequencyLabel(swapInterval.interval, remainingSwaps.toString()),
                    }}
                  />
                </Typography>
                <Typography variant="caption" color="rgba(255, 255, 255, 0.5);">
                  <FormattedMessage
                    description="days to finish"
                    defaultMessage="({swaps} SWAP{plural})"
                    values={{
                      swaps: remainingSwaps.toString(),
                      plural: remainingSwaps.toNumber() !== 1 ? 's' : '',
                    }}
                  />
                </Typography>
              </StyledFreqLeft>
            )}
            {!isPending && hasNoFunds && position.status === 'TERMINATED' && (
              <StyledStale>
                <Typography variant="caption">
                  <FormattedMessage description="finishedPosition" defaultMessage="CLOSED" />
                </Typography>
              </StyledStale>
            )}
            {!isPending && hasNoFunds && position.status !== 'TERMINATED' && !isOldVersion && (
              <StyledFinished>
                <Typography variant="caption">
                  <FormattedMessage description="finishedPosition" defaultMessage="FINISHED" />
                </Typography>
              </StyledFinished>
            )}
            {!isPending && !hasNoFunds && position.status !== 'TERMINATED' && isStale && !isOldVersion && (
              <StyledStale>
                <Typography variant="caption">
                  <FormattedMessage description="stale" defaultMessage="STALE" />
                </Typography>
              </StyledStale>
            )}
            {!isPending && isOldVersion && position.status !== 'TERMINATED' && (
              <StyledDeprecated>
                <Typography variant="caption">
                  <FormattedMessage description="deprecated" defaultMessage="DEPRECATED" />
                </Typography>
              </StyledDeprecated>
            )}
          </StyledDetailWrapper>
          <StyledDetailWrapper>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
              <FormattedMessage description="positionDetailsExecutedTitle" defaultMessage="Executed:" />
            </Typography>
            <Typography
              variant="body1"
              color={executedSwaps ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}
              sx={{ marginLeft: '5px' }}
            >
              <FormattedMessage
                description="positionDetailsExecuted"
                defaultMessage="{swaps} swap{plural}"
                values={{ swaps: executedSwaps, plural: executedSwaps !== 1 ? 's' : '' }}
              />
            </Typography>
          </StyledDetailWrapper>
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
              extraText={
                showToFullPrice && `(${(toFullPrice + (showBreakdown ? 0 : toYieldFullPrice || 0)).toFixed(2)} USD)`
              }
              icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={position.to} />}
            >
              <Typography variant="body2">
                {formatCurrencyAmount(BigNumber.from(swappedToShow), position.to, 4)}
              </Typography>
            </CustomChip>
            {swappedYield.gt(BigNumber.from(0)) && showBreakdown && (
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
            <CustomChip
              extraText={showRatePrice && `(${ratePrice.toFixed(2)} USD)`}
              icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={position.from} />}
            >
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
                extraText={
                  showFromPrice && `(${(fromPrice + (showBreakdown ? 0 : fromYieldPrice || 0)).toFixed(2)} USD)`
                }
                icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={position.from} />}
              >
                <Typography variant="body2">
                  {formatCurrencyAmount(BigNumber.from(remainingLiquidityToShow), position.from, 4)}
                </Typography>
              </CustomChip>
              {yieldFromGenerated.gt(BigNumber.from(0)) && showBreakdown && (
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
                extraText={showToPrice && `(${(toPrice + (showBreakdown ? 0 : toYieldPrice || 0)).toFixed(2)} USD)`}
                icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={position.to} />}
              >
                <Typography variant="body2">
                  {formatCurrencyAmount(BigNumber.from(toWithdrawToShow), position.to, 4)}
                </Typography>
              </CustomChip>
              {toWithdrawYield.gt(BigNumber.from(0)) && showBreakdown && (
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
          {(foundYieldFrom || foundYieldTo) && (
            <StyledDetailWrapper>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                <FormattedMessage description="positionDetailsYieldsTitle" defaultMessage="Yields:" />
              </Typography>
              {foundYieldFrom && (
                <CustomChip
                  icon={
                    <ComposedTokenIcon
                      isInChip
                      size="16px"
                      tokenBottom={position.from}
                      tokenTop={foundYieldFrom.token}
                    />
                  }
                  tooltip
                  tooltipTitle={
                    <FormattedMessage
                      description="generatingYieldAt"
                      defaultMessage="Generating {token} at {platform} with {apy}% APY"
                      values={{
                        token: position.from.symbol,
                        apy: parseFloat(foundYieldFrom.apy.toFixed(2)).toString(),
                        platform: foundYieldFrom.name,
                      }}
                    />
                  }
                >
                  <Typography variant="body2" fontWeight={500}>
                    APY {parseFloat(foundYieldFrom.apy.toFixed(2)).toString()}%
                  </Typography>
                </CustomChip>
              )}
              {foundYieldTo && (
                <CustomChip
                  icon={
                    <ComposedTokenIcon isInChip size="16px" tokenBottom={position.to} tokenTop={foundYieldTo.token} />
                  }
                  tooltip
                  tooltipTitle={
                    <FormattedMessage
                      description="generatingYieldAt"
                      defaultMessage="Generating {token} at {platform} with {apy}% APY"
                      values={{
                        token: position.to.symbol,
                        apy: parseFloat(foundYieldTo.apy.toFixed(2)).toString(),
                        platform: foundYieldTo.name,
                      }}
                    />
                  }
                >
                  <Typography variant="body2" fontWeight={500}>
                    APY {parseFloat(foundYieldTo.apy.toFixed(2)).toString()}%
                  </Typography>
                </CustomChip>
              )}
            </StyledDetailWrapper>
          )}
        </StyledContentContainer>
        <PositionDataControls
          onReusePosition={onReusePosition}
          disabled={disabled}
          position={position}
          yieldOptions={yieldOptions}
          pendingTransaction={pendingTransaction}
          onMigrateYield={onMigrateYield}
          onSuggestMigrateYield={onSuggestMigrateYield}
        />
      </StyledCardContent>
    </StyledCard>
  );
};
export default Details;
