import React from 'react';
import { Position } from '@types';
import {
  Typography,
  Chip,
  Tooltip,
  colors,
  ContainerBox,
  ArrowRightIcon,
  PositionProgressBar,
  Divider,
  Skeleton,
} from 'ui-library';
import TokenIcon from '@common/components/token-icon';
import { DateTime } from 'luxon';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  formatCurrencyAmount,
  getNetworkCurrencyTokens,
  parseNumberUsdPriceToBigInt,
  parseUsdPrice,
} from '@common/utils/currency';
import { calculateAvgBuyPrice, getTimeFrequencyLabel, usdFormatter } from '@common/utils/parsing';
import { NETWORKS, STABLE_COINS, STRING_SWAP_INTERVALS, TESTNETS, VERSIONS_ALLOWED_MODIFY } from '@constants';
import find from 'lodash/find';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import { formatUnits } from 'viem';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import Address from '@common/components/address';
import { ActionTypeAction } from '@mean-finance/sdk';
import { capitalize, isUndefined } from 'lodash';
import useTotalGasSaved from '@hooks/useTotalGasSaved';

interface PositionStatusLabelProps {
  position: Position;
  isPending: boolean;
  isOldVersion: boolean;
  hasNoFunds: boolean;
}

const PositionStatusLabel = ({ position, isPending, isOldVersion, hasNoFunds }: PositionStatusLabelProps) => {
  const intl = useIntl();

  if (isPending) {
    return (
      <Typography variant="bodySmall" fontWeight={700} color="warning.dark">
        <FormattedMessage description="pending transaction" defaultMessage="Pending transaction" />
      </Typography>
    );
  }

  if (position.status === 'TERMINATED') {
    return hasNoFunds ? (
      <Typography variant="bodySmall" fontWeight={700} color="warning.dark">
        <FormattedMessage description="closedPosition" defaultMessage="Closed" />
      </Typography>
    ) : undefined;
  }

  if (isOldVersion) {
    return hasNoFunds ? (
      <Typography variant="bodySmall" fontWeight={700} color="warning.dark">
        <FormattedMessage description="deprecated" defaultMessage="Deprecated" />;
      </Typography>
    ) : undefined;
  }

  if (position.isStale) {
    return !hasNoFunds ? (
      <Typography variant="bodySmall" fontWeight={700} color="warning.dark">
        <FormattedMessage description="stale" defaultMessage="Stale" />
      </Typography>
    ) : undefined;
  }

  if (!hasNoFunds) {
    return (
      <ContainerBox gap={0.5}>
        <Typography variant="bodySmall" fontWeight={700}>
          <FormattedMessage
            description="days to finish"
            defaultMessage="{type} left"
            values={{
              type: getTimeFrequencyLabel(intl, position.swapInterval.toString(), position.remainingSwaps.toString()),
            }}
          />
        </Typography>
        <Typography variant="bodySmall">
          <FormattedMessage
            description="positionDetailsSwapsLeft"
            defaultMessage="({swaps} swap{plural})"
            values={{
              swaps: Number(position.remainingSwaps),
              plural: Number(position.remainingSwaps) !== 1 ? 's' : '',
            }}
          />
        </Typography>
      </ContainerBox>
    );
  }

  if (position.toWithdraw.amount > 0n) {
    return (
      <Typography variant="bodySmall" fontWeight={700} color="success.dark">
        <FormattedMessage description="finishedPosition" defaultMessage="Finished" />
      </Typography>
    );
  } else {
    return (
      <Typography variant="bodySmall" fontWeight={700} color="success.dark">
        <FormattedMessage description="donePosition" defaultMessage="Done" />
      </Typography>
    );
  }
};

interface DetailsProps {
  position: Position;
  pendingTransaction: string | null;
}

export const StyledHeader = styled(ContainerBox).attrs({ justifyContent: 'space-between', gap: 1 })`
  ${({ theme: { spacing, palette } }) => `
  padding-bottom: ${spacing(4.5)};
  border-bottom: 1px solid ${colors[palette.mode].border.border2};
  `}
`;

const Details = ({ position, pendingTransaction }: DetailsProps) => {
  const { from, to, swapInterval, chainId, user } = position;
  const [totalGasSaved, isLoadingTotalGasSaved] = useTotalGasSaved(position);
  const intl = useIntl();

  const positionNetwork = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const supportedNetwork = find(NETWORKS, { chainId })!;
    return supportedNetwork;
  }, [chainId]);

  const {
    toWithdraw,
    remainingLiquidity: totalRemainingLiquidity,
    rate,
    remainingSwaps,
    totalSwaps,
    remainingLiquidityYield: yieldFromGenerated,
    swapped,
    nextSwapAvailableAt,
  } = position;
  const remainingLiquidity = totalRemainingLiquidity.amount - (yieldFromGenerated?.amount || 0n);

  const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);

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

  const averageBuyPrice = calculateAvgBuyPrice({ positionHistory: position.history, tokenFrom: tokenFromAverage });

  const totalDeposited = position.history?.reduce<bigint>((acc, event) => {
    let newAcc = acc;
    if (event.action === ActionTypeAction.CREATED) {
      newAcc += event.rate * BigInt(event.swaps);
    } else if (event.action === ActionTypeAction.MODIFIED) {
      newAcc += event.rate * BigInt(event.remainingSwaps) - event.oldRate * BigInt(event.oldRemainingSwaps);
    }
    return newAcc;
  }, 0n);

  const showFromPrice = !isUndefined(from.price);
  const showToPrice = !isUndefined(to.price);

  const ratePrice = parseUsdPrice(position.from, rate.amount, parseNumberUsdPriceToBigInt(from.price));
  const toWithdrawPrice = parseUsdPrice(position.to, toWithdraw.amount, parseNumberUsdPriceToBigInt(to.price));
  const swappedPrice = parseUsdPrice(to, swapped.amount, parseNumberUsdPriceToBigInt(to.price));
  const totalDepositedPrice = parseUsdPrice(position.from, totalDeposited, parseNumberUsdPriceToBigInt(from.price));
  const totalRemainingPrice = parseUsdPrice(
    position.from,
    totalRemainingLiquidity.amount,
    parseNumberUsdPriceToBigInt(from.price)
  );

  const hasNoFunds = BigInt(remainingLiquidity) <= 0n;

  const executedSwaps = Number(totalSwaps) - Number(remainingSwaps);

  const isOldVersion = !VERSIONS_ALLOWED_MODIFY.includes(position.version);

  const isTestnet = TESTNETS.includes(positionNetwork.chainId);

  const { mainCurrencyToken } = getNetworkCurrencyTokens(positionNetwork);

  return (
    <ContainerBox flexDirection="column" gap={8}>
      <StyledHeader>
        <ContainerBox gap={2}>
          <ComposedTokenIcon tokenBottom={from} tokenTop={to} size={8} />
          <ContainerBox gap={0.5} alignItems="center">
            <Typography variant="body">{from.symbol}</Typography>
            <ArrowRightIcon fontSize="small" />
            <Typography variant="body">{to.symbol}</Typography>
          </ContainerBox>
        </ContainerBox>
        <ContainerBox gap={4} alignItems="center">
          <Typography variant="bodySmall">
            <Address address={user} trimAddress />
          </Typography>
          <TokenIcon token={mainCurrencyToken} size={8} />
        </ContainerBox>
      </StyledHeader>
      <ContainerBox flexDirection="column" gap={3}>
        <ContainerBox justifyContent="space-between" fullWidth alignItems="end">
          {position.status !== 'TERMINATED' && (
            <ContainerBox flexDirection="column" gap={1}>
              <Typography variant="bodySmall">
                <FormattedMessage description="positionDetailsToWithdrawTitle" defaultMessage="To withdraw" />
              </Typography>
              <ContainerBox>
                <Tooltip
                  title={
                    showToPrice && (
                      <Typography variant="body" fontWeight={700}>
                        ${usdFormatter(toWithdrawPrice, 2)}
                      </Typography>
                    )
                  }
                >
                  <ContainerBox gap={1} alignItems="center">
                    <TokenIcon isInChip size={7} token={to} />
                    <Typography variant="bodyLarge" fontWeight={700} lineHeight={1}>
                      {formatCurrencyAmount(toWithdraw.amount, to, 4)}
                    </Typography>
                  </ContainerBox>
                </Tooltip>
              </ContainerBox>
            </ContainerBox>
          )}
          <PositionStatusLabel
            position={position}
            isPending={pendingTransaction !== null}
            isOldVersion={isOldVersion}
            hasNoFunds={hasNoFunds}
          />
        </ContainerBox>
        <PositionProgressBar
          value={totalSwaps === 0n ? 0 : Number((100n * (totalSwaps - remainingSwaps)) / totalSwaps)}
        />
        {isTestnet && (
          <ContainerBox>
            <Chip
              label={<FormattedMessage description="testnet" defaultMessage="Testnet" />}
              size="small"
              color="warning"
            />
          </ContainerBox>
        )}
      </ContainerBox>
      <Divider />
      <ContainerBox flexDirection="column" gap={5}>
        <ContainerBox gap={10}>
          {position.status === 'TERMINATED' && (
            <ContainerBox flexDirection="column">
              <Typography variant="bodySmall">
                <FormattedMessage description="executed" defaultMessage="Executed" />
              </Typography>
              <Typography variant="body" fontWeight={700}>
                <FormattedMessage
                  description="positionDetailsExecuted"
                  defaultMessage="{swaps} swap{plural}"
                  values={{ swaps: executedSwaps, plural: executedSwaps !== 1 ? 's' : '' }}
                />
              </Typography>
            </ContainerBox>
          )}
          <ContainerBox flexDirection="column">
            <Typography variant="bodySmall">
              <FormattedMessage description="frequency" defaultMessage="Frequency" />
            </Typography>
            <Typography variant="body" fontWeight={700}>
              <FormattedMessage
                description="positionFrequencyAdverb"
                defaultMessage="{frequency}"
                values={{
                  frequency: capitalize(
                    intl.formatMessage(
                      STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].adverb
                    )
                  ),
                }}
              />
            </Typography>
          </ContainerBox>
          <ContainerBox flexDirection="column">
            <Typography variant="bodySmall">
              <FormattedMessage description="duration" defaultMessage="Duration" />
            </Typography>
            <Typography variant="body" fontWeight={700}>
              {getTimeFrequencyLabel(intl, swapInterval.toString(), totalSwaps.toString())}
            </Typography>
          </ContainerBox>
          {position.status !== 'TERMINATED' && !!nextSwapAvailableAt && !hasNoFunds && !isOldVersion && (
            <ContainerBox flexDirection="column">
              <Typography variant="bodySmall">
                <FormattedMessage description="positionDetailsNextSwapAtTitle" defaultMessage="Next swap" />
              </Typography>
              {DateTime.now().toSeconds() < DateTime.fromSeconds(nextSwapAvailableAt).toSeconds() ? (
                <Typography variant="body" fontWeight={700}>
                  {DateTime.fromSeconds(nextSwapAvailableAt).toRelative()}
                </Typography>
              ) : (
                <Typography variant="body" fontWeight={700}>
                  <FormattedMessage description="positionDetailsNextSwapInProgress" defaultMessage="in progress" />
                </Typography>
              )}
            </ContainerBox>
          )}
        </ContainerBox>
        <ContainerBox gap={10}>
          <ContainerBox flexDirection="column">
            <Typography variant="bodySmall">
              <FormattedMessage description="initialInvestmentTotal" defaultMessage="Initial Investment Total" />
            </Typography>
            <ContainerBox gap={2} alignItems="center">
              <TokenIcon size={5} token={from} />
              <ContainerBox gap={0.5} flexWrap="wrap">
                <Typography variant="body" fontWeight={700}>
                  {formatCurrencyAmount(totalDeposited, from, 3)} {from.symbol}
                </Typography>
                <Typography variant="body">(${usdFormatter(totalDepositedPrice, 2)})</Typography>
              </ContainerBox>
            </ContainerBox>
          </ContainerBox>
          <ContainerBox flexDirection="column">
            <Typography variant="bodySmall">
              <FormattedMessage description="averageBuyPrice" defaultMessage="Average buy price" />
            </Typography>
            <Typography variant="body" fontWeight={700}>
              {averageBuyPrice > 0n ? (
                <FormattedMessage
                  description="positionDetailsAverageBuyPrice"
                  defaultMessage="1 {from} = {currencySymbol}{average} {to}"
                  values={{
                    from: tokenFromAverage.symbol,
                    to: !STABLE_COINS.includes(tokenToAverage.symbol) ? tokenToAverage.symbol : '',
                    average: formatCurrencyAmount(averageBuyPrice, tokenToAverage, 3),
                    currencySymbol: STABLE_COINS.includes(tokenToAverage.symbol) ? '$' : '',
                  }}
                />
              ) : (
                <FormattedMessage description="positionDetailsAverageBuyPriceNotSwap" defaultMessage="No swaps yet" />
              )}
            </Typography>
          </ContainerBox>
        </ContainerBox>
        <ContainerBox flexDirection="column">
          <Typography variant="bodySmall">
            <FormattedMessage description="swapped" defaultMessage="Swapped" />
          </Typography>
          <ContainerBox gap={2} alignItems="center">
            <TokenIcon size={5} token={to} />
            <ContainerBox gap={0.5}>
              <Typography variant="body" fontWeight={700}>
                {formatCurrencyAmount(swapped.amount, to, 4)} {to.symbol}
              </Typography>
              {showToPrice && <Typography variant="body">(${usdFormatter(swappedPrice, 2)})</Typography>}
            </ContainerBox>
          </ContainerBox>
        </ContainerBox>
        <ContainerBox flexDirection="column">
          <Typography variant="bodySmall">
            <FormattedMessage
              description="youPayPerInterval"
              defaultMessage="You pay per {interval}"
              values={{
                interval: intl.formatMessage(STRING_SWAP_INTERVALS[swapInterval.toString()].singularSubject),
              }}
            />
          </Typography>
          <ContainerBox gap={2} alignItems="center">
            <TokenIcon size={5} token={from} />
            <ContainerBox gap={0.5} flexWrap="wrap">
              <Typography variant="body" fontWeight={700}>
                {formatCurrencyAmount(rate.amount, from, 4)} {from.symbol}
              </Typography>
              <ContainerBox gap={0.5}>
                {showFromPrice && <Typography variant="body">(${usdFormatter(ratePrice, 2)})</Typography>}
                <Typography variant="body">
                  <FormattedMessage
                    description="positionDetailsCurrentRate"
                    defaultMessage="{frequency} {hasYield}"
                    values={{
                      hasYield: !!from.underlyingTokens.length
                        ? intl.formatMessage(
                            defineMessage({
                              defaultMessage: '+ yield',
                              description: 'plusYield',
                            })
                          )
                        : '',
                      frequency: intl.formatMessage(
                        STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].every
                      ),
                    }}
                  />
                </Typography>
              </ContainerBox>
            </ContainerBox>
          </ContainerBox>
        </ContainerBox>
        {!!totalGasSaved && positionNetwork?.chainId === NETWORKS.mainnet.chainId && (
          <ContainerBox flexDirection="column">
            <Typography variant="bodySmall">
              <FormattedMessage description="positionDetailsGasSavedPriceTitle" defaultMessage="Total gas saved:" />
            </Typography>
            <Typography variant="body" fontWeight={700}>
              {isLoadingTotalGasSaved ? (
                <Skeleton variant="text" animation="wave" width="10ch" />
              ) : (
                <FormattedMessage
                  description="positionDetailsGasSaved"
                  defaultMessage="${gasSaved}"
                  values={{
                    gasSaved: usdFormatter(parseFloat(formatUnits(totalGasSaved, 36)), 2),
                  }}
                />
              )}
            </Typography>
          </ContainerBox>
        )}
        {position.status !== 'TERMINATED' && (
          <ContainerBox flexDirection="column">
            <Typography variant="bodySmall">
              <FormattedMessage description="positionDetailsRemainingFundsTitle" defaultMessage="Remaining" />
            </Typography>
            <ContainerBox gap={2} alignItems="center">
              <TokenIcon size={5} token={from} />
              <ContainerBox gap={0.5} flexWrap="wrap">
                <Typography variant="body" fontWeight={700}>
                  {formatCurrencyAmount(totalRemainingLiquidity.amount, from, 3)} {from.symbol}
                </Typography>
                {showFromPrice && <Typography variant="body">(${usdFormatter(totalRemainingPrice, 2)})</Typography>}
              </ContainerBox>
            </ContainerBox>
          </ContainerBox>
        )}
        <ContainerBox flexDirection="column">
          <Typography variant="bodySmall">
            <FormattedMessage description="yields" defaultMessage="Yields" />
          </Typography>
          <ContainerBox gap={10}>
            {position.yields.from && (
              <ContainerBox gap={2} alignItems="center">
                <ComposedTokenIcon size={5} tokenTop={position.yields.from.token} tokenBottom={from} />
                <ContainerBox gap={0.5} flexWrap="wrap">
                  <Typography variant="body" fontWeight={700}>
                    {position.yields.from.name}
                  </Typography>
                  <Typography variant="body">(APY {position.yields.from.apy.toFixed(2)}%)</Typography>
                </ContainerBox>
              </ContainerBox>
            )}
            {position.yields.to && (
              <ContainerBox gap={2} alignItems="center">
                <ComposedTokenIcon size={5} tokenTop={position.yields.to.token} tokenBottom={to} />
                <ContainerBox gap={0.5} flexWrap="wrap">
                  <Typography variant="body" fontWeight={700}>
                    {position.yields.to.name}
                  </Typography>
                  <Typography variant="body">(APY {position.yields.to.apy.toFixed(2)}%)</Typography>
                </ContainerBox>
              </ContainerBox>
            )}
            {!position.yields.from && !position.yields.to && (
              <Typography variant="body" fontWeight={700}>
                <FormattedMessage
                  description="positionNotGainingInterest"
                  defaultMessage="Position not generating yield"
                />
              </Typography>
            )}
          </ContainerBox>
        </ContainerBox>
      </ContainerBox>
    </ContainerBox>
  );
};
export default Details;
