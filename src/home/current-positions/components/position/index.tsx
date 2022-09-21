import * as React from 'react';
import find from 'lodash/find';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import TokenIcon from 'common/token-icon';
import { getTimeFrequencyLabel, sortTokens, calculateStale, STALE } from 'utils/parsing';
import { ChainId, NetworkStruct, Position, Token, YieldOptions } from 'types';
import { NETWORKS, POSITION_VERSION_2, STABLE_COINS, STRING_SWAP_INTERVALS } from 'config/constants';
import useAvailablePairs from 'hooks/useAvailablePairs';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { createStyles } from '@mui/material/styles';
import { withStyles } from '@mui/styles';
import { BigNumber } from 'ethers';
import { emptyTokenWithAddress, formatCurrencyAmount } from 'utils/currency';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import useUsdPrice from 'hooks/useUsdPrice';
import ComposedTokenIcon from 'common/composed-token-icon';
import CustomChip from 'common/custom-chip';
import PositionControls from '../position-controls';

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

const StyledChip = styled(Chip)`
  margin: 0px 5px;
`;

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

const StyledDetailWrapper = styled.div<{ alignItems?: string; gap?: boolean }>`
  margin-bottom: 5px;
  display: flex;
  align-items: ${({ alignItems }) => alignItems || 'center'};
  justify-content: flex-start;
  ${({ gap }) => (gap ? 'gap: 5px;' : '')}
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
  onTerminate: (position: Position) => void;
  onReusePosition: (position: Position) => void;
  onMigrateYield: (position: Position) => void;
  disabled: boolean;
  hasSignSupport: boolean;
  network: NetworkStruct;
  yieldOptionsByChain: Record<ChainId, YieldOptions>;
}

const ActivePosition = ({
  position,
  onWithdraw,
  onReusePosition,
  onTerminate,
  onMigrateYield,
  disabled,
  hasSignSupport,
  network,
  yieldOptionsByChain,
}: ActivePositionProps) => {
  const {
    from,
    to,
    swapInterval,
    remainingLiquidity: rawRemainingLiquidity,
    remainingSwaps,
    rate,
    depositedRateUnderlying,
    totalSwaps,
    pendingTransaction,
    toWithdraw,
    chainId,
  } = position;
  const positionNetwork = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const supportedNetwork = find(NETWORKS, { chainId })!;
    return supportedNetwork;
  }, [chainId]);
  const yieldOptions = yieldOptionsByChain[chainId];

  const availablePairs = useAvailablePairs();
  const [toPrice, isLoadingToPrice] = useUsdPrice(to, toWithdraw, undefined, chainId);

  const rateToUse = depositedRateUnderlying || rate;
  const remainingLiquidity = depositedRateUnderlying
    ? depositedRateUnderlying.mul(remainingSwaps)
    : rawRemainingLiquidity;

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
  const showToPrice = !STABLE_COINS.includes(to.symbol) && !isLoadingToPrice && !!toPrice;

  const hasNoFunds = remainingLiquidity.lte(BigNumber.from(0));

  const isStale =
    calculateStale(pair?.lastExecutedAt || position.pairLastSwappedAt || 0, swapInterval, position.startedAt) === STALE;

  const isOldVersion = position.version === POSITION_VERSION_2;

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
            {/* {showFromPrice && (
                <StyledChip
                  variant="outlined"
                  size="small"
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
              )} */}
            <Typography
              variant="body1"
              color={remainingLiquidity.gt(BigNumber.from(0)) ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}
              sx={{ marginLeft: '5px' }}
            >
              <FormattedMessage
                description="current remaining rate"
                defaultMessage="{remainingLiquidity} {from} ({rate} {from} {frequency})"
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                  rate: formatCurrencyAmount(rateToUse, from, 4),
                  frequency:
                    STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].adverb,
                  from: from.symbol,
                  remainingLiquidity: formatCurrencyAmount(remainingLiquidity, from, 4),
                }}
              />
            </Typography>
          </StyledDetailWrapper>
          <StyledDetailWrapper alignItems="flex-start">
            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
              <FormattedMessage description="current swapped in position" defaultMessage="To withdraw: " />
            </Typography>
            <Typography
              variant="body1"
              color={toWithdraw.gt(BigNumber.from(0)) ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}
              sx={{ marginLeft: '5px' }}
            >
              {`${formatCurrencyAmount(toWithdraw, to, 4)} ${to.symbol}`}
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
          {!foundYieldFrom && !foundYieldTo && (
            <StyledDetailWrapper alignItems="flex-start">
              <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                <FormattedMessage
                  description="positionNotGainingInterest"
                  defaultMessage="Position not generating yield"
                />
              </Typography>
            </StyledDetailWrapper>
          )}
          {(foundYieldFrom || foundYieldTo) && (
            <StyledDetailWrapper alignItems="flex-start" gap>
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
          <StyledProgressWrapper>
            <BorderLinearProgress
              swaps={remainingSwaps.toNumber()}
              variant="determinate"
              value={100 * ((totalSwaps.toNumber() - remainingSwaps.toNumber()) / totalSwaps.toNumber())}
            />
          </StyledProgressWrapper>
        )}
        <PositionControls
          position={position}
          onWithdraw={onWithdraw}
          onReusePosition={onReusePosition}
          onTerminate={onTerminate}
          onMigrateYield={onMigrateYield}
          disabled={disabled}
          hasSignSupport={!!hasSignSupport}
          network={network}
          yieldOptions={yieldOptions}
        />
      </StyledCardContent>
    </StyledCard>
  );
};
export default ActivePosition;
