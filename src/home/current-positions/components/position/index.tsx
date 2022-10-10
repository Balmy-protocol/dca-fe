import * as React from 'react';
import find from 'lodash/find';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import TokenIcon from 'common/token-icon';
import { getTimeFrequencyLabel, sortTokens, calculateStale, STALE, calculateYield } from 'utils/parsing';
import { ChainId, NetworkStruct, Position, Token, YieldOptions } from 'types';
import { NETWORKS, STRING_SWAP_INTERVALS, VERSIONS_ALLOWED_MODIFY } from 'config/constants';
import useAvailablePairs from 'hooks/useAvailablePairs';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { createStyles } from '@mui/material/styles';
import { withStyles } from '@mui/styles';
import { BigNumber } from 'ethers';
import { emptyTokenWithAddress, formatCurrencyAmount } from 'utils/currency';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import ComposedTokenIcon from 'common/composed-token-icon';
import CustomChip from 'common/custom-chip';
import { Theme, Tooltip } from '@mui/material';
import PositionControls from '../position-controls';

const StyledSwapsLinearProgress = styled(LinearProgress)<{ swaps: number }>``;

const DarkTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    // backgroundColor: theme.palette.primary.dark,
    // color: theme.palette.common.white,
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))(Tooltip);

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

const StyledDetailWrapper = styled.div<{ alignItems?: string; flex?: boolean; $spacing?: boolean }>`
  margin-bottom: 5px;
  display: flex;
  align-items: ${({ alignItems }) => alignItems || 'center'};
  justify-content: flex-start;
  ${({ flex }) => (flex ? 'flex: 1;' : '')}
  ${({ $spacing }) => ($spacing ? 'margin-top: 10px;' : '')}
  gap: 5px;
  flex-wrap: wrap;
`;

const StyledProgressWrapper = styled.div`
  margin: 12px 0px;
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

const StyledDeprecated = styled.div`
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

interface PositionProp extends Omit<Position, 'from' | 'to'> {
  from: Token;
  to: Token;
}

interface ActivePositionProps {
  position: PositionProp;
  onWithdraw: (position: Position, useProtocolToken?: boolean) => void;
  onReusePosition: (position: Position) => void;
  onMigrateYield: (position: Position) => void;
  onSuggestMigrateYield: (position: Position) => void;
  disabled: boolean;
  hasSignSupport: boolean;
  network: NetworkStruct;
  yieldOptionsByChain: Record<ChainId, YieldOptions>;
}

const ActivePosition = ({
  position,
  onWithdraw,
  onReusePosition,
  onMigrateYield,
  onSuggestMigrateYield,
  disabled,
  hasSignSupport,
  network,
  yieldOptionsByChain,
}: ActivePositionProps) => {
  const {
    from,
    to,
    swapInterval,
    remainingLiquidity: remainingLiquidityRaw,
    remainingSwaps,
    rate,
    depositedRateUnderlying,
    totalSwaps,
    pendingTransaction,
    toWithdraw: rawToWithdraw,
    toWithdrawUnderlying,
    remainingLiquidityUnderlying,
    toWithdrawUnderlyingAccum,
    chainId,
  } = position;
  const positionNetwork = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const supportedNetwork = find(NETWORKS, { chainId })!;
    return supportedNetwork;
  }, [chainId]);
  const yieldOptions = yieldOptionsByChain[chainId];

  const availablePairs = useAvailablePairs();

  const rateToUse = depositedRateUnderlying || rate;

  const toWithdraw = toWithdrawUnderlying || rawToWithdraw;
  const toWithdrawYield =
    toWithdrawUnderlyingAccum && toWithdrawUnderlying
      ? toWithdrawUnderlying.sub(toWithdrawUnderlyingAccum)
      : BigNumber.from(0);
  const toWithdrawBase = toWithdraw.sub(toWithdrawYield);

  const { yieldGenerated: yieldFromGenerated, base: remainingLiquidity } = calculateYield(
    remainingLiquidityUnderlying || BigNumber.from(remainingLiquidityRaw),
    rateToUse,
    remainingSwaps
  );

  const isPending = !!pendingTransaction;
  const wrappedProtocolToken = getWrappedProtocolToken(positionNetwork.chainId);
  const [token0, token1] = sortTokens(
    from.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : from,
    to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : to
  );
  const pair = find(
    availablePairs,
    (findigPair) => findigPair.token0.address === token0.address && findigPair.token1.address === token1.address
  );
  const hasNoFunds = remainingLiquidity.lte(BigNumber.from(0));

  const isStale =
    calculateStale(pair?.lastExecutedAt || position.pairLastSwappedAt || 0, swapInterval, position.startedAt) === STALE;

  const isOldVersion = !VERSIONS_ALLOWED_MODIFY.includes(position.version);

  const foundYieldFrom =
    position.from.underlyingTokens[0] &&
    find(yieldOptions, { tokenAddress: position.from.underlyingTokens[0].address });
  const foundYieldTo =
    position.to.underlyingTokens[0] && find(yieldOptions, { tokenAddress: position.to.underlyingTokens[0].address });

  return (
    <StyledCard variant="outlined">
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
            {!isPending && !hasNoFunds && !isStale && !isOldVersion && (
              <StyledFreqLeft>
                <Typography variant="caption">
                  <FormattedMessage
                    description="days to finish"
                    defaultMessage="{type} left"
                    values={{
                      type: getTimeFrequencyLabel(swapInterval.toString(), remainingSwaps.toString()),
                    }}
                  />
                </Typography>
              </StyledFreqLeft>
            )}
            {!isPending && hasNoFunds && !isOldVersion && (
              <StyledFinished>
                <Typography variant="caption">
                  <FormattedMessage description="finishedPosition" defaultMessage="FINISHED" />
                </Typography>
              </StyledFinished>
            )}
            {!isPending && !hasNoFunds && isStale && !isOldVersion && (
              <StyledStale>
                <Typography variant="caption">
                  <FormattedMessage description="stale" defaultMessage="STALE" />
                </Typography>
              </StyledStale>
            )}
            {isOldVersion && (
              <StyledDeprecated>
                <Typography variant="caption">
                  <FormattedMessage description="deprecated" defaultMessage="DEPRECATED" />
                </Typography>
              </StyledDeprecated>
            )}
          </StyledCardHeader>
          <StyledDetailWrapper alignItems="flex-start">
            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
              <FormattedMessage
                description="current remaining"
                defaultMessage="Remaining:"
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                }}
              />
            </Typography>
            <CustomChip icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={position.from} />}>
              <Typography variant="body2">
                {formatCurrencyAmount(BigNumber.from(remainingLiquidity), position.from, 4)}
              </Typography>
            </CustomChip>
            {yieldFromGenerated.gt(BigNumber.from(0)) && (
              <>
                +
                <CustomChip
                  icon={
                    <ComposedTokenIcon
                      isInChip
                      size="16px"
                      tokenTop={foundYieldFrom?.token}
                      tokenBottom={position.from}
                    />
                  }
                >
                  <Typography variant="body2">
                    {formatCurrencyAmount(BigNumber.from(yieldFromGenerated), position.from, 4)}
                  </Typography>
                </CustomChip>
              </>
            )}
          </StyledDetailWrapper>
          <StyledDetailWrapper alignItems="flex-start">
            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
              <FormattedMessage
                description="current rate remaining"
                defaultMessage="Rate:"
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                }}
              />
            </Typography>
            <CustomChip icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={position.from} />}>
              <Typography variant="body2">
                {formatCurrencyAmount(BigNumber.from(rateToUse), position.from, 4)}
              </Typography>
            </CustomChip>
            <FormattedMessage
              description="positionDetailsCurrentRate"
              defaultMessage="{frequency} {hasYield}"
              values={{
                b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                hasYield: position.from.underlyingTokens.length ? '+ yield' : '',
                frequency:
                  STRING_SWAP_INTERVALS[position.swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].adverb,
              }}
            />
          </StyledDetailWrapper>
          <StyledDetailWrapper>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
              <FormattedMessage description="positionDetailsToWithdrawTitle" defaultMessage="To withdraw: " />
            </Typography>
            <CustomChip icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={position.to} />}>
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
                    <ComposedTokenIcon isInChip size="16px" tokenTop={foundYieldTo?.token} tokenBottom={position.to} />
                  }
                >
                  <Typography variant="body2">{formatCurrencyAmount(toWithdrawYield, position.to, 4)}</Typography>
                </CustomChip>
              </>
            )}
          </StyledDetailWrapper>
          {!foundYieldFrom && !foundYieldTo && (
            <StyledDetailWrapper alignItems="flex-start" $spacing>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                <FormattedMessage
                  description="positionNotGainingInterest"
                  defaultMessage="Position not generating yield"
                />
              </Typography>
            </StyledDetailWrapper>
          )}
          {(foundYieldFrom || foundYieldTo) && (
            <StyledDetailWrapper alignItems="flex-start" flex $spacing>
              {foundYieldFrom && (
                <CustomChip
                  icon={
                    <ComposedTokenIcon
                      isInChip
                      size="16px"
                      tokenTop={foundYieldFrom.token}
                      tokenBottom={position.from}
                    />
                  }
                  tooltip
                  tooltipTitle={
                    <FormattedMessage
                      description="generatingYieldAt"
                      defaultMessage="Generating {token} at {platform} with {apy}% APY"
                      values={{
                        token: position.from.symbol,
                        apy: foundYieldFrom.apy.toFixed(0),
                        platform: foundYieldFrom.name,
                      }}
                    />
                  }
                >
                  <Typography variant="body2" fontWeight={500}>
                    APY {foundYieldFrom.apy.toFixed(0)}%
                  </Typography>
                </CustomChip>
              )}
              {foundYieldTo && (
                <CustomChip
                  icon={
                    <ComposedTokenIcon isInChip size="16px" tokenTop={foundYieldTo.token} tokenBottom={position.to} />
                  }
                  tooltip
                  tooltipTitle={
                    <FormattedMessage
                      description="generatingYieldAt"
                      defaultMessage="Generating {token} at {platform} with {apy}% APY"
                      values={{
                        token: position.to.symbol,
                        apy: foundYieldTo.apy.toFixed(0),
                        platform: foundYieldTo.name,
                      }}
                    />
                  }
                >
                  <Typography variant="body2" fontWeight={500}>
                    APY {foundYieldTo.apy.toFixed(0)}%
                  </Typography>
                </CustomChip>
              )}
            </StyledDetailWrapper>
          )}
        </StyledContentContainer>
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
                value={100 * ((totalSwaps.toNumber() - remainingSwaps.toNumber()) / totalSwaps.toNumber())}
              />
            </StyledProgressWrapper>
          </DarkTooltip>
        )}
        <PositionControls
          position={position}
          onWithdraw={onWithdraw}
          onReusePosition={onReusePosition}
          onMigrateYield={onMigrateYield}
          disabled={disabled}
          hasSignSupport={!!hasSignSupport}
          network={network}
          yieldOptions={yieldOptions}
          onSuggestMigrateYield={onSuggestMigrateYield}
        />
      </StyledCardContent>
    </StyledCard>
  );
};
export default ActivePosition;
