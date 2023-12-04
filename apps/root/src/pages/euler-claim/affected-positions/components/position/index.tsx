import * as React from 'react';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import { DateTime } from 'luxon';
import { Typography, Card, CardContent, Tooltip, ArrowRightAltIcon, Theme } from 'ui-library';
import styled from 'styled-components';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import TokenIcon from '@common/components/token-icon';
import { sortTokensByAddress } from '@common/utils/parsing';
import { Position, Token, YieldOptions } from '@types';
import { NETWORKS, STRING_SWAP_INTERVALS, SWAP_INTERVALS_MAP } from '@constants';
import useAvailablePairs from '@hooks/useAvailablePairs';
import { withStyles } from 'tss-react/mui';
import { BigNumber } from 'ethers';
import { emptyTokenWithAddress, formatCurrencyAmount } from '@common/utils/currency';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import CustomChip from '@common/components/custom-chip';
import useUsdPrice from '@hooks/useUsdPrice';
import PositionControls from '../position-controls';

const DarkTooltip = withStyles(Tooltip, (theme: Theme) => ({
  tooltip: {
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}));

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
  yieldOptions: YieldOptions;
}

const ActivePosition = ({ position, yieldOptions }: ActivePositionProps) => {
  const {
    from,
    to,
    swapInterval,
    remainingLiquidity: totalRemainingLiquidity,
    remainingSwaps,
    rate,
    toWithdrawYield,
    remainingLiquidityYield: yieldFromGenerated,
    toWithdraw,
    chainId,
  } = position;
  const positionNetwork = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const supportedNetwork = find(NETWORKS, { chainId })!;
    return supportedNetwork;
  }, [chainId]);

  const availablePairs = useAvailablePairs();

  const intl = useIntl();

  const toWithdrawBase = toWithdraw.sub(toWithdrawYield || BigNumber.from(0));

  const remainingLiquidity = totalRemainingLiquidity.sub(yieldFromGenerated || BigNumber.from(0));

  const intervalIndex = findIndex(SWAP_INTERVALS_MAP, { value: swapInterval });

  const [toPrice, isLoadingToPrice] = useUsdPrice(to, toWithdrawBase);
  const [toYieldPrice, isLoadingToYieldPrice] = useUsdPrice(to, toWithdrawYield);
  const [ratePrice, isLoadingRatePrice] = useUsdPrice(from, rate);
  const [fromPrice, isLoadingFromPrice] = useUsdPrice(from, remainingLiquidity);
  const [fromYieldPrice, isLoadingFromYieldPrice] = useUsdPrice(from, yieldFromGenerated);

  const showToPrice = !isLoadingToPrice && !!toPrice;
  const showToYieldPrice = !isLoadingToYieldPrice && !!toYieldPrice;
  const showRatePrice = !isLoadingRatePrice && !!ratePrice;
  const showFromPrice = !isLoadingFromPrice && !!fromPrice;
  const showFromYieldPrice = !isLoadingFromYieldPrice && !!fromYieldPrice;

  const wrappedProtocolToken = getWrappedProtocolToken(positionNetwork.chainId);

  const pair = React.useMemo(() => {
    if (!from || !to) return undefined;
    const tokenA =
      (from.underlyingTokens[0] && from.underlyingTokens[0].address) ||
      (from.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : from.address);
    const tokenB =
      (to.underlyingTokens[0] && to.underlyingTokens[0].address) ||
      (to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : to.address);

    const [pairToken0, pairToken1] = sortTokensByAddress(tokenA, tokenB);

    return find(
      availablePairs,
      (currentPair) =>
        currentPair.token0.address === pairToken0.toLocaleLowerCase() &&
        currentPair.token1.address === pairToken1.toLocaleLowerCase()
    );
  }, [from, to, availablePairs]);

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
              <Typography variant="body">{from.symbol}</Typography>
              <StyledArrowRightContainer>
                <ArrowRightAltIcon fontSize="inherit" />
              </StyledArrowRightContainer>
              <TokenIcon token={to} size="27px" />
              <Typography variant="body">{to.symbol}</Typography>
            </StyledCardTitleHeader>
          </StyledCardHeader>
          <StyledDetailWrapper alignItems="flex-start">
            <Typography variant="body">
              <FormattedMessage
                description="current remaining"
                defaultMessage="Remaining:"
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                }}
              />
            </Typography>
            <CustomChip
              tooltip={showFromPrice}
              tooltipTitle={
                <FormattedMessage
                  description="current swapped in position price"
                  defaultMessage="~ {fromPrice} USD"
                  values={{
                    b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                    fromPrice: showFromPrice ? fromPrice?.toFixed(2) : 0,
                  }}
                />
              }
              icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={position.from} />}
            >
              <Typography variant="bodySmall">
                {formatCurrencyAmount(BigNumber.from(remainingLiquidity), position.from, 4)}
              </Typography>
            </CustomChip>
            {yieldFromGenerated?.gt(BigNumber.from(0)) && (
              <>
                +
                <CustomChip
                  tooltip={showFromYieldPrice}
                  tooltipTitle={
                    <FormattedMessage
                      description="current swapped in position price"
                      defaultMessage="~ {fromPrice} USD"
                      values={{
                        b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                        fromPrice: showFromYieldPrice ? fromYieldPrice?.toFixed(2) : 0,
                      }}
                    />
                  }
                  icon={
                    <ComposedTokenIcon
                      isInChip
                      size="16px"
                      tokenTop={foundYieldFrom?.token}
                      tokenBottom={position.from}
                    />
                  }
                >
                  <Typography variant="bodySmall">
                    {formatCurrencyAmount(BigNumber.from(yieldFromGenerated), position.from, 4)}
                  </Typography>
                </CustomChip>
              </>
            )}
          </StyledDetailWrapper>
          <StyledDetailWrapper alignItems="flex-start">
            <Typography variant="body">
              <FormattedMessage
                description="current rate remaining"
                defaultMessage="Rate:"
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                }}
              />
            </Typography>
            <CustomChip
              tooltip={showRatePrice}
              tooltipTitle={
                <FormattedMessage
                  description="current swapped in position price"
                  defaultMessage="~ {fromPrice} USD"
                  values={{
                    b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                    fromPrice: showRatePrice ? ratePrice?.toFixed(2) : 0,
                  }}
                />
              }
              icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={position.from} />}
            >
              <Typography variant="bodySmall">
                {formatCurrencyAmount(BigNumber.from(rate), position.from, 4)}
              </Typography>
            </CustomChip>
            <FormattedMessage
              description="positionDetailsCurrentRate"
              defaultMessage="{frequency} {hasYield}"
              values={{
                b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                hasYield: position.from.underlyingTokens.length
                  ? intl.formatMessage(
                      defineMessage({
                        defaultMessage: '+ yield',
                        description: 'plusYield',
                      })
                    )
                  : '',
                frequency: intl.formatMessage(
                  STRING_SWAP_INTERVALS[position.swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].adverb
                ),
              }}
            />
          </StyledDetailWrapper>
          <StyledDetailWrapper>
            <Typography variant="body">
              <FormattedMessage description="positionDetailsToWithdrawTitle" defaultMessage="To withdraw: " />
            </Typography>
            <CustomChip
              tooltip={showToPrice}
              tooltipTitle={
                <FormattedMessage
                  description="current swapped in position price"
                  defaultMessage="~ {fromPrice} USD"
                  values={{
                    b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                    fromPrice: showToPrice ? toPrice?.toFixed(2) : 0,
                  }}
                />
              }
              icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={position.to} />}
            >
              <Typography variant="bodySmall">
                {formatCurrencyAmount(BigNumber.from(toWithdrawBase), position.to, 4)}
              </Typography>
            </CustomChip>
            {toWithdrawYield?.gt(BigNumber.from(0)) && (
              <>
                +
                {/* <Typography variant="bodySmall" >
                  <FormattedMessage description="plusYield" defaultMessage="+ yield" />
                </Typography> */}
                <CustomChip
                  tooltip={showToYieldPrice}
                  tooltipTitle={
                    <FormattedMessage
                      description="current swapped in position price"
                      defaultMessage="~ {fromPrice} USD"
                      values={{
                        b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                        fromPrice: showToYieldPrice ? toYieldPrice?.toFixed(2) : 0,
                      }}
                    />
                  }
                  icon={
                    <ComposedTokenIcon isInChip size="16px" tokenTop={foundYieldTo?.token} tokenBottom={position.to} />
                  }
                >
                  <Typography variant="bodySmall">{formatCurrencyAmount(toWithdrawYield, position.to, 4)}</Typography>
                </CustomChip>
              </>
            )}
          </StyledDetailWrapper>
          {remainingSwaps.gt(BigNumber.from(0)) && !!pair?.nextSwapAvailableAt[intervalIndex] && (
            <StyledDetailWrapper>
              <Typography variant="body">
                <FormattedMessage description="positionDetailsNextSwapTitle" defaultMessage="Next swap: " />
              </Typography>
              {DateTime.now().toSeconds() <
                DateTime.fromSeconds(pair.nextSwapAvailableAt[intervalIndex]).toSeconds() && (
                <DarkTooltip
                  title={DateTime.fromSeconds(pair.nextSwapAvailableAt[intervalIndex]).toLocaleString(
                    DateTime.DATETIME_FULL_WITH_SECONDS
                  )}
                  arrow
                  placement="top"
                >
                  <Typography variant="body">
                    {DateTime.fromSeconds(pair.nextSwapAvailableAt[intervalIndex]).toRelative()}
                  </Typography>
                </DarkTooltip>
              )}
              {DateTime.now().toSeconds() >
                DateTime.fromSeconds(pair.nextSwapAvailableAt[intervalIndex]).toSeconds() && (
                <DarkTooltip
                  title={
                    <FormattedMessage
                      description="positionDetailsNextSwapInProgressTooltip"
                      defaultMessage="Market Makers should execute your swap anytime now"
                    />
                  }
                  arrow
                  placement="top"
                >
                  <Typography variant="body">
                    <FormattedMessage description="positionDetailsNextSwapInProgress" defaultMessage="in progress" />
                  </Typography>
                </DarkTooltip>
              )}
            </StyledDetailWrapper>
          )}
          {!foundYieldFrom && !foundYieldTo && (
            <StyledDetailWrapper alignItems="flex-start" $spacing>
              <Typography variant="body">
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
                        apy: parseFloat(foundYieldFrom.apy.toFixed(2)).toString(),
                        platform: foundYieldFrom.name,
                      }}
                    />
                  }
                >
                  <Typography variant="bodySmall" fontWeight={500}>
                    APY {parseFloat(foundYieldFrom.apy.toFixed(2)).toString()}%
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
                        apy: parseFloat(foundYieldTo.apy.toFixed(2)).toString(),
                        platform: foundYieldTo.name,
                      }}
                    />
                  }
                >
                  <Typography variant="bodySmall" fontWeight={500}>
                    APY {parseFloat(foundYieldTo.apy.toFixed(2)).toString()}%
                  </Typography>
                </CustomChip>
              )}
            </StyledDetailWrapper>
          )}
        </StyledContentContainer>
        <PositionControls position={position} />
      </StyledCardContent>
    </StyledCard>
  );
};
export default ActivePosition;
