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
  Skeleton,
} from 'ui-library';
import TokenIcon from '@common/components/token-icon';
import { DateTime } from 'luxon';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  formatCurrencyAmount,
  formatUsdAmount,
  getNetworkCurrencyTokens,
  parseNumberUsdPriceToBigInt,
  parseUsdPrice,
} from '@common/utils/currency';
import { calculateAvgBuyPrice, getTimeFrequencyLabel, usdFormatter } from '@common/utils/parsing';
import { NETWORKS, STABLE_COINS, STRING_SWAP_INTERVALS, TESTNETS, VERSIONS_ALLOWED_MODIFY } from '@constants';
import find from 'lodash/find';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import { formatUnits } from 'viem';
import Address from '@common/components/address';
import { ActionTypeAction } from '@balmy/sdk';
import { capitalize, isUndefined } from 'lodash';
import useTotalGasSaved from '@hooks/useTotalGasSaved';
import NetWorthNumber from '@common/components/networth-number';
import PositionDataMainButton from './main-buttons';

interface PositionStatusLabelProps {
  position: Position;
  isPending: boolean;
  isOldVersion: boolean;
  hasNoFunds: boolean;
}

const StyledDataTitle = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
    ...rest
  }) => ({ color: colors[mode].typography.typo3, variant: 'labelRegular', ...rest })
)``;
const StyledDataValue = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
    ...rest
  }) => ({ color: colors[mode].typography.typo2, variant: 'bodySmallBold', ...rest })
)``;
const StyledValueContainer = styled(ContainerBox).attrs((props) => ({ gap: 1, flexDirection: 'column', ...props }))``;

const PositionStatusLabel = ({ position, isPending, isOldVersion, hasNoFunds }: PositionStatusLabelProps) => {
  const intl = useIntl();

  if (isPending) {
    return (
      <StyledDataValue color="warning.dark">
        <FormattedMessage description="pending transaction" defaultMessage="Pending transaction" />
      </StyledDataValue>
    );
  }

  if (position.status === 'TERMINATED') {
    return hasNoFunds ? (
      <StyledDataValue color="warning.dark">
        <FormattedMessage description="closedPosition" defaultMessage="Closed" />
      </StyledDataValue>
    ) : undefined;
  }

  if (isOldVersion) {
    return hasNoFunds ? (
      <StyledDataValue color="warning.dark">
        <FormattedMessage description="deprecated" defaultMessage="Deprecated" />;
      </StyledDataValue>
    ) : undefined;
  }

  if (position.isStale) {
    return !hasNoFunds ? (
      <StyledDataValue color="warning.dark">
        <FormattedMessage description="stale" defaultMessage="Stale" />
      </StyledDataValue>
    ) : undefined;
  }

  if (!hasNoFunds) {
    return (
      <ContainerBox gap={0.5}>
        <StyledDataValue>
          <FormattedMessage
            description="days to finish"
            defaultMessage="{type} left"
            values={{
              type: getTimeFrequencyLabel(intl, position.swapInterval.toString(), position.remainingSwaps.toString()),
            }}
          />
        </StyledDataValue>
        <Typography variant="bodySmallRegular">
          {position.remainingSwaps === 1n ? (
            <FormattedMessage
              description="dca.position-details.position-data.remaining-swaps.singular"
              defaultMessage="(1 swap)"
            />
          ) : (
            <FormattedMessage
              description="dca.position-details.position-data.remaining-swaps.plural"
              defaultMessage="({swaps} swaps)"
              values={{
                swaps: Number(position.remainingSwaps),
              }}
            />
          )}
        </Typography>
      </ContainerBox>
    );
  }

  if (position.toWithdraw.amount > 0n) {
    return (
      <StyledDataValue color="success.dark">
        <FormattedMessage description="finishedPosition" defaultMessage="Finished" />
      </StyledDataValue>
    );
  } else {
    return (
      <StyledDataValue color="success.dark">
        <FormattedMessage description="donePosition" defaultMessage="Done" />
      </StyledDataValue>
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
  border-bottom: 1px solid ${colors[palette.mode].border.border1};
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

  const { averageBuyPrice, tokenFromAverage, tokenToAverage } = calculateAvgBuyPrice(position);

  const totalDeposited = position.history?.reduce<bigint>((acc, event) => {
    if (event.action === ActionTypeAction.CREATED) {
      // eslint-disable-next-line no-param-reassign
      acc += event.rate * BigInt(event.swaps);
    } else if (event.action === ActionTypeAction.MODIFIED) {
      // eslint-disable-next-line no-param-reassign
      acc += event.rate * BigInt(event.remainingSwaps) - event.oldRate * BigInt(event.oldRemainingSwaps);
    }
    return acc;
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
    <ContainerBox flexDirection="column" gap={6}>
      <StyledHeader>
        <ContainerBox gap={2}>
          <ComposedTokenIcon tokens={[from, to]} size={8} overlapRatio={0.6} marginRight={5} />
          <ContainerBox gap={0.5} alignItems="center">
            <StyledDataValue>{from.symbol}</StyledDataValue>
            <ArrowRightIcon fontSize="small" />
            <StyledDataValue>{to.symbol}</StyledDataValue>
          </ContainerBox>
        </ContainerBox>
        <ContainerBox gap={4} alignItems="center">
          <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
            <Address address={user} trimAddress />
          </Typography>
          <TokenIcon token={mainCurrencyToken} size={8} border />
        </ContainerBox>
      </StyledHeader>
      <ContainerBox flexDirection="column" gap={3}>
        <ContainerBox justifyContent="space-between" fullWidth alignItems="end">
          {position.status !== 'TERMINATED' && (
            <ContainerBox flexDirection="column" gap={1}>
              <StyledDataTitle>
                <FormattedMessage description="positionDetailsToWithdrawTitle" defaultMessage="To withdraw" />
              </StyledDataTitle>
              <ContainerBox>
                <Tooltip title={showToPrice && <StyledDataValue>${usdFormatter(toWithdrawPrice, 2)}</StyledDataValue>}>
                  <ContainerBox gap={1} alignItems="center">
                    <TokenIcon isInChip size={7} token={to} />
                    <NetWorthNumber
                      isFiat={false}
                      value={Number(formatCurrencyAmount({ amount: toWithdraw.amount || 0n, token: to, sigFigs: 4 }))}
                      variant="h3Bold"
                    />
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
      <ContainerBox flexDirection="column" gap={6}>
        <ContainerBox gap={10}>
          {position.status === 'TERMINATED' && (
            <StyledValueContainer>
              <StyledDataTitle>
                <FormattedMessage description="executed" defaultMessage="Executed" />
              </StyledDataTitle>
              <StyledDataValue>
                {executedSwaps === 1 ? (
                  <FormattedMessage
                    defaultMessage="1 swap"
                    description="dca.position-details.position-data.executed-swaps.singular"
                  />
                ) : (
                  <FormattedMessage
                    description="dca.position-details.position-data.executed-swaps.plural"
                    defaultMessage="{swaps} swaps"
                    values={{ swaps: executedSwaps }}
                  />
                )}
              </StyledDataValue>
            </StyledValueContainer>
          )}
          <StyledValueContainer>
            <StyledDataTitle>
              <FormattedMessage description="frequency" defaultMessage="Frequency" />
            </StyledDataTitle>
            <StyledDataValue>
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
            </StyledDataValue>
          </StyledValueContainer>
          <StyledValueContainer>
            <StyledDataTitle>
              <FormattedMessage description="duration" defaultMessage="Duration" />
            </StyledDataTitle>
            <StyledDataValue>
              {getTimeFrequencyLabel(intl, swapInterval.toString(), totalSwaps.toString())}
            </StyledDataValue>
          </StyledValueContainer>
          {position.status !== 'TERMINATED' && !!nextSwapAvailableAt && !hasNoFunds && !isOldVersion && (
            <StyledValueContainer>
              <StyledDataTitle>
                <FormattedMessage description="positionDetailsNextSwapAtTitle" defaultMessage="Next swap" />
              </StyledDataTitle>
              {DateTime.now().toSeconds() < DateTime.fromSeconds(nextSwapAvailableAt).toSeconds() ? (
                <StyledDataValue>{DateTime.fromSeconds(nextSwapAvailableAt).toRelative()}</StyledDataValue>
              ) : (
                <StyledDataValue>
                  <FormattedMessage description="positionDetailsNextSwapInProgress" defaultMessage="in progress" />
                </StyledDataValue>
              )}
            </StyledValueContainer>
          )}
        </ContainerBox>
        <ContainerBox gap={10}>
          <StyledValueContainer>
            <StyledDataTitle>
              <FormattedMessage description="initialInvestmentTotal" defaultMessage="Initial Investment Total" />
            </StyledDataTitle>
            <ContainerBox gap={2} alignItems="center">
              <TokenIcon size={5} token={from} />
              <ContainerBox gap={0.5} flexWrap="wrap" alignItems="center">
                <StyledDataValue>
                  {formatCurrencyAmount({ amount: totalDeposited, token: from, sigFigs: 3, intl })} {from.symbol}
                </StyledDataValue>
                <StyledDataValue>(${usdFormatter(totalDepositedPrice, 2)})</StyledDataValue>
              </ContainerBox>
            </ContainerBox>
          </StyledValueContainer>
          <StyledValueContainer>
            <StyledDataTitle>
              <FormattedMessage description="averageBuyPrice" defaultMessage="Average buy price" />
            </StyledDataTitle>
            <StyledDataValue>
              {averageBuyPrice > 0n ? (
                <FormattedMessage
                  description="positionDetailsAverageBuyPrice"
                  defaultMessage="1 {from} = {currencySymbol}{average} {to}"
                  values={{
                    from: tokenFromAverage.symbol,
                    to: !STABLE_COINS.includes(tokenToAverage.symbol) ? tokenToAverage.symbol : '',
                    average: formatCurrencyAmount({ amount: averageBuyPrice, token: tokenToAverage, sigFigs: 3, intl }),
                    currencySymbol: STABLE_COINS.includes(tokenToAverage.symbol) ? '$' : '',
                  }}
                />
              ) : (
                <FormattedMessage description="positionDetailsAverageBuyPriceNotSwap" defaultMessage="No swaps yet" />
              )}
            </StyledDataValue>
          </StyledValueContainer>
        </ContainerBox>
        <StyledValueContainer>
          <StyledDataTitle>
            <FormattedMessage description="swapped" defaultMessage="Swapped" />
          </StyledDataTitle>
          <ContainerBox gap={2} alignItems="center">
            <TokenIcon size={5} token={to} />
            <ContainerBox gap={0.5} alignItems="center">
              <StyledDataValue>
                {formatCurrencyAmount({ amount: swapped.amount, token: to, sigFigs: 4, intl })} {to.symbol}
              </StyledDataValue>
              {showToPrice && <StyledDataValue>(${usdFormatter(swappedPrice, 2)})</StyledDataValue>}
            </ContainerBox>
          </ContainerBox>
        </StyledValueContainer>
        <StyledValueContainer>
          <StyledDataTitle>
            <FormattedMessage
              description="youPayPerInterval"
              defaultMessage="You pay per {interval}"
              values={{
                interval: intl.formatMessage(STRING_SWAP_INTERVALS[swapInterval.toString()].singularSubject),
              }}
            />
          </StyledDataTitle>
          <ContainerBox gap={2} alignItems="center">
            <TokenIcon size={5} token={from} />
            <ContainerBox gap={0.5} flexWrap="wrap" alignItems="center">
              <StyledDataValue>
                {formatCurrencyAmount({ amount: rate.amount, token: from, sigFigs: 4, intl })} {from.symbol}
              </StyledDataValue>
              <ContainerBox gap={0.5} alignItems="center">
                {showFromPrice && <StyledDataValue>(${usdFormatter(ratePrice, 2)})</StyledDataValue>}
                <StyledDataValue>
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
                </StyledDataValue>
              </ContainerBox>
            </ContainerBox>
          </ContainerBox>
        </StyledValueContainer>
        {!!totalGasSaved && positionNetwork?.chainId === NETWORKS.mainnet.chainId && (
          <StyledValueContainer>
            <StyledDataTitle>
              <FormattedMessage description="positionDetailsGasSavedPriceTitle" defaultMessage="Total gas saved:" />
            </StyledDataTitle>
            <StyledDataValue>
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
            </StyledDataValue>
          </StyledValueContainer>
        )}
        {position.status !== 'TERMINATED' && (
          <StyledValueContainer>
            <StyledDataTitle>
              <FormattedMessage description="positionDetailsRemainingFundsTitle" defaultMessage="Remaining" />
            </StyledDataTitle>
            <ContainerBox gap={2} alignItems="center">
              <TokenIcon size={5} token={from} />
              <ContainerBox gap={0.5} flexWrap="wrap" alignItems="center">
                <StyledDataValue>
                  {formatCurrencyAmount({ amount: totalRemainingLiquidity.amount, token: from, sigFigs: 3, intl })}{' '}
                  {from.symbol}
                </StyledDataValue>
                {showFromPrice && <StyledDataValue>(${usdFormatter(totalRemainingPrice, 2)})</StyledDataValue>}
              </ContainerBox>
            </ContainerBox>
          </StyledValueContainer>
        )}
        <StyledValueContainer>
          <StyledDataTitle>
            <FormattedMessage description="yields" defaultMessage="Yields" />
          </StyledDataTitle>
          <ContainerBox gap={10}>
            {position.yields.from && (
              <ContainerBox gap={2} alignItems="center">
                <ComposedTokenIcon size={5} tokens={[from, position.yields.from.token]} />
                <ContainerBox gap={0.5} flexWrap="wrap">
                  <StyledDataValue>{position.yields.from.name}</StyledDataValue>
                  <StyledDataValue>
                    (APY {formatUsdAmount({ amount: position.yields.from.apy, intl })}%)
                  </StyledDataValue>
                </ContainerBox>
              </ContainerBox>
            )}
            {position.yields.to && (
              <ContainerBox gap={2} alignItems="center">
                <ComposedTokenIcon size={5} tokens={[to, position.yields.to.token]} />
                <ContainerBox gap={0.5} flexWrap="wrap">
                  <StyledDataValue>{position.yields.to.name}</StyledDataValue>
                  <StyledDataValue>(APY {formatUsdAmount({ amount: position.yields.to.apy, intl })}%)</StyledDataValue>
                </ContainerBox>
              </ContainerBox>
            )}
            {!position.yields.from && !position.yields.to && (
              <StyledDataValue>
                <FormattedMessage
                  description="positionNotGainingInterest"
                  defaultMessage="Position not generating yield"
                />
              </StyledDataValue>
            )}
          </ContainerBox>
        </StyledValueContainer>
        <StyledValueContainer>
          <PositionDataMainButton position={position} />
        </StyledValueContainer>
      </ContainerBox>
    </ContainerBox>
  );
};
export default Details;
