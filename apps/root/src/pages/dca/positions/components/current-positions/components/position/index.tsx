import * as React from 'react';
import find from 'lodash/find';
import { DateTime } from 'luxon';
import {
  Chip,
  Link,
  Typography,
  Tooltip,
  Card,
  CardContent,
  LinearProgress,
  ErrorOutlineIcon,
  createStyles,
  Theme,
  colors,
  ArrowRightIcon,
  ContainerBox,
} from 'ui-library';
import styled from 'styled-components';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import TokenIcon from '@common/components/token-icon';
import { getTimeFrequencyLabel } from '@common/utils/parsing';
import { ChainId, Position, Token, WalletStatus, YieldOptions } from '@types';
import {
  AAVE_FROZEN_TOKENS,
  CHAIN_CHANGING_WALLETS_WITHOUT_REFRESH,
  NETWORKS,
  STRING_SWAP_INTERVALS,
  TESTNETS,
  VERSIONS_ALLOWED_MODIFY,
} from '@constants';
import { withStyles } from 'tss-react/mui';

import { formatCurrencyAmount, getNetworkCurrencyTokens } from '@common/utils/currency';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import CustomChip from '@common/components/custom-chip';
import useUsdPrice from '@hooks/useUsdPrice';
import PositionCardButton from '../position-card-button';
import Address from '@common/components/address';
import { useThemeMode } from '@state/config/hooks';
import { upperCase } from 'lodash';
import useTrackEvent from '@hooks/useTrackEvent';
import PositionOptions from '../position-options';
import useWallet from '@hooks/useWallet';
import useWalletNetwork from '@hooks/useWalletNetwork';

const StyledSwapsLinearProgress = styled(LinearProgress)<{ swaps: number }>``;

const DarkTooltip = withStyles(Tooltip, (theme: Theme) => ({
  tooltip: {
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}));

const BorderLinearProgress = withStyles(StyledSwapsLinearProgress, ({ palette: { mode } }) =>
  createStyles({
    root: {
      height: 8,
      borderRadius: 10,
      background: colors[mode].background.primary,
    },
    bar: {
      borderRadius: 10,
      background: `linear-gradient(90deg, ${colors[mode].violet.violet200} 0%, ${colors[mode].violet.violet800} 123.4%)`,
    },
  })
);

const StyledCard = styled(Card)`
  ${({ theme: { spacing } }) => `
  padding: ${spacing(8)};
  `}
`;

const StyledCardHeader = styled(ContainerBox).attrs({ justifyContent: 'space-between' })`
  ${({ theme: { spacing, palette } }) => `
  margin-bottom: ${spacing(4.5)};
  border-bottom: 1px solid ${colors[palette.mode].border.border2};
  `}
`;

const StyledLink = styled(Link)`
  margin: 0px 5px;
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
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
    color: ${colors[mode].semantic.warning.primary};
    display: flex;
    align-items: center;
    text-transform: uppercase;
  `}
`;

const StyledDeprecated = styled.div`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
  color: ${colors[mode].semantic.warning.primary};
  display: flex;
  align-items: center;
  text-transform: uppercase;
  `}
`;

const StyledFinished = styled.div`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
  color: ${colors[mode].semantic.success.primary};
  display: flex;
  align-items: center;
  text-transform: uppercase;
  `}
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
  onTerminate: (position: Position) => void;
  onSuggestMigrateYield: (position: Position) => void;
  disabled: boolean;
  hasSignSupport: boolean;
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
  onTerminate,
  yieldOptionsByChain,
}: ActivePositionProps) => {
  const {
    from,
    to,
    swapInterval,
    remainingLiquidity: totalRemainingLiquidity,
    remainingSwaps,
    rate,
    totalSwaps,
    pendingTransaction,
    toWithdraw,
    toWithdrawYield,
    chainId,
    isStale,
    remainingLiquidityYield: yieldFromGenerated,
    user,
  } = position;
  const positionNetwork = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const supportedNetwork = find(NETWORKS, { chainId })!;
    return supportedNetwork;
  }, [chainId]);
  const yieldOptions = yieldOptionsByChain[chainId];

  const intl = useIntl();
  const mode = useThemeMode();
  const trackEvent = useTrackEvent();
  const wallet = useWallet(user);

  const toWithdrawBase = toWithdraw - (toWithdrawYield || 0n);
  const remainingLiquidity = totalRemainingLiquidity - (yieldFromGenerated || 0n);

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

  const isPending = !!pendingTransaction;

  const hasNoFunds = remainingLiquidity <= 0n;

  const isOldVersion = !VERSIONS_ALLOWED_MODIFY.includes(position.version);

  const [connectedNetwork] = useWalletNetwork(user);
  const isOnNetwork = connectedNetwork?.chainId === positionNetwork.chainId;
  const walletIsConnected = wallet.status === WalletStatus.connected;
  const showSwitchAction =
    walletIsConnected && !isOnNetwork && !CHAIN_CHANGING_WALLETS_WITHOUT_REFRESH.includes(wallet.providerInfo.name);

  const foundYieldFrom =
    position.from.underlyingTokens[0] &&
    find(yieldOptions, { tokenAddress: position.from.underlyingTokens[0].address });
  const foundYieldTo =
    position.to.underlyingTokens[0] && find(yieldOptions, { tokenAddress: position.to.underlyingTokens[0].address });

  const isTestnet = TESTNETS.includes(positionNetwork.chainId);

  const { mainCurrencyToken } = getNetworkCurrencyTokens(positionNetwork);

  const handleOnWithdraw = (useProtocolToken: boolean) => {
    onWithdraw(position, useProtocolToken);
    trackEvent('DCA - Position List - Withdraw', { useProtocolToken });
  };

  return (
    <StyledCard variant="outlined">
      <CardContent>
        <StyledContentContainer>
          <StyledCardHeader>
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
                <Address address={position.user} trimAddress />
              </Typography>
              <Typography variant="bodySmall">
                <FormattedMessage
                  description="positionFrequencyAdverb"
                  defaultMessage="{frequency}"
                  values={{
                    frequency: upperCase(
                      intl.formatMessage(
                        STRING_SWAP_INTERVALS[position.swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS]
                          .adverb
                      )
                    ),
                  }}
                />
              </Typography>
              <TokenIcon token={mainCurrencyToken} size={8} />
              <PositionOptions
                position={position}
                disabled={disabled}
                onTerminate={onTerminate}
                handleOnWithdraw={handleOnWithdraw}
                hasSignSupport={!!hasSignSupport}
                showSwitchAction={showSwitchAction}
              />
            </ContainerBox>
          </StyledCardHeader>
          {!isPending && !hasNoFunds && !isStale && (
            <StyledFreqLeft>
              <Typography variant="caption">
                <FormattedMessage
                  description="days to finish"
                  defaultMessage="{type} left"
                  values={{
                    type: getTimeFrequencyLabel(intl, swapInterval.toString(), remainingSwaps.toString()),
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
          {isOldVersion && hasNoFunds && (
            <StyledDeprecated>
              <Typography variant="caption">
                <FormattedMessage description="deprecated" defaultMessage="DEPRECATED" />
              </Typography>
            </StyledDeprecated>
          )}
          {isTestnet && (
            <StyledDetailWrapper alignItems="flex-start">
              <Chip
                label={<FormattedMessage description="testnet" defaultMessage="Testnet" />}
                size="small"
                color="warning"
              />
            </StyledDetailWrapper>
          )}
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
              icon={<ComposedTokenIcon isInChip size={4} tokenBottom={position.from} />}
            >
              <Typography variant="bodySmall">
                {formatCurrencyAmount(BigInt(remainingLiquidity), position.from, 4)}
              </Typography>
            </CustomChip>
            {(yieldFromGenerated || 0n) > 0n && (
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
                    <ComposedTokenIcon isInChip size={4} tokenTop={foundYieldFrom?.token} tokenBottom={position.from} />
                  }
                >
                  <Typography variant="bodySmall">
                    {formatCurrencyAmount(BigInt(yieldFromGenerated || 0n), position.from, 4)}
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
              icon={<ComposedTokenIcon isInChip size={4} tokenBottom={position.from} />}
            >
              <Typography variant="bodySmall">{formatCurrencyAmount(BigInt(rate), position.from, 4)}</Typography>
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
              icon={<ComposedTokenIcon isInChip size={4} tokenBottom={position.to} />}
            >
              <Typography variant="bodySmall">
                {formatCurrencyAmount(BigInt(toWithdrawBase), position.to, 4)}
              </Typography>
            </CustomChip>
            {(toWithdrawYield || 0n) > 0n && (
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
                    <ComposedTokenIcon isInChip size={4} tokenTop={foundYieldTo?.token} tokenBottom={position.to} />
                  }
                >
                  <Typography variant="bodySmall">
                    {formatCurrencyAmount(toWithdrawYield || 0n, position.to, 4)}
                  </Typography>
                </CustomChip>
              </>
            )}
          </StyledDetailWrapper>
          {remainingSwaps > 0n && (
            <StyledDetailWrapper>
              <Typography variant="body">
                <FormattedMessage description="positionDetailsNextSwapTitle" defaultMessage="Next swap: " />
              </Typography>
              {DateTime.now().toSeconds() < DateTime.fromSeconds(position.nextSwapAvailableAt).toSeconds() && (
                <DarkTooltip
                  title={DateTime.fromSeconds(position.nextSwapAvailableAt).toLocaleString(
                    DateTime.DATETIME_FULL_WITH_SECONDS
                  )}
                  arrow
                  placement="top"
                >
                  <Typography variant="body">
                    {DateTime.fromSeconds(position.nextSwapAvailableAt).toRelative()}
                  </Typography>
                </DarkTooltip>
              )}
              {DateTime.now().toSeconds() > DateTime.fromSeconds(position.nextSwapAvailableAt).toSeconds() && (
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
                    <ComposedTokenIcon isInChip size={4} tokenTop={foundYieldFrom.token} tokenBottom={position.from} />
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
                  icon={<ComposedTokenIcon isInChip size={4} tokenTop={foundYieldTo.token} tokenBottom={position.to} />}
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
          {((position.from.symbol === 'CRV' && foundYieldFrom) || (position.to.symbol === 'CRV' && foundYieldTo)) && (
            <StyledDetailWrapper alignItems="flex-start">
              <Typography
                variant="bodySmall"
                color={colors[mode].semantic.warning.primary}
                sx={{ display: 'flex', marginTop: '2px' }}
              >
                <ErrorOutlineIcon fontSize="inherit" />
              </Typography>
              <Typography
                variant="caption"
                color={colors[mode].semantic.warning.primary}
                sx={{ display: 'flex', flex: '1' }}
              >
                <FormattedMessage
                  description="positionCRVNotSupported"
                  defaultMessage="Unfortunately, the CRV token can no longer be used as collateral on Aave V3. This means that it's not possible to swap this position."
                />
              </Typography>
            </StyledDetailWrapper>
          )}
          {(position.from.symbol === 'UNIDX' || position.to.symbol === 'UNIDX') && (
            <StyledDetailWrapper alignItems="flex-start">
              <Typography
                variant="bodySmall"
                color={colors[mode].semantic.warning.primary}
                sx={{ display: 'flex', marginTop: '2px' }}
              >
                <ErrorOutlineIcon fontSize="inherit" />
              </Typography>
              <Typography
                variant="caption"
                color={colors[mode].semantic.warning.primary}
                sx={{ display: 'flex', flex: '1' }}
              >
                <FormattedMessage
                  description="positionUNIDXNotSupported"
                  defaultMessage="$UNIDX liquidity has been moved out of Uniswap, thus rendering the oracle unreliable. Swaps have been paused until a reliable oracle for $UNIDX is available"
                />
              </Typography>
            </StyledDetailWrapper>
          )}
          {position.from.symbol === 'LPT' && (
            <StyledDetailWrapper alignItems="flex-start">
              <Typography
                variant="bodySmall"
                color={colors[mode].semantic.warning.primary}
                sx={{ display: 'flex', marginTop: '2px' }}
              >
                <ErrorOutlineIcon fontSize="inherit" />
              </Typography>
              <Typography
                variant="caption"
                color={colors[mode].semantic.warning.primary}
                sx={{ display: 'flex', flex: '1' }}
              >
                <FormattedMessage
                  description="positionLPTNotSupported"
                  defaultMessage="Livepeer liquidity on Arbitrum has decreased significantly, so adding funds is disabled until this situation has reverted."
                />
              </Typography>
            </StyledDetailWrapper>
          )}
          {position.from.symbol === 'jEUR' && foundYieldFrom && (
            <StyledDetailWrapper alignItems="flex-start">
              <Typography
                variant="bodySmall"
                color={colors[mode].semantic.warning.primary}
                sx={{ display: 'flex', marginTop: '2px' }}
              >
                <ErrorOutlineIcon fontSize="inherit" />
              </Typography>
              <Typography
                variant="caption"
                color={colors[mode].semantic.warning.primary}
                sx={{ display: 'flex', flex: '1' }}
              >
                <FormattedMessage
                  description="positionJEURNotSupported"
                  defaultMessage="Due to the latest developments Aave has paused the $jEUR lending and borrowing. As a result, increasing the position has been disabled. Read more about this here"
                />
                <StyledLink href="https://app.aave.com/governance/proposal/?proposalId=143" target="_blank">
                  <FormattedMessage description="here" defaultMessage="here." />
                </StyledLink>
              </Typography>
            </StyledDetailWrapper>
          )}
          {position.from.symbol === 'agEUR' ||
            (position.to.symbol === 'agEUR' && (
              <StyledDetailWrapper alignItems="flex-start">
                <Typography
                  variant="bodySmall"
                  color={colors[mode].semantic.warning.primary}
                  sx={{ display: 'flex', marginTop: '2px' }}
                >
                  <ErrorOutlineIcon fontSize="inherit" />
                </Typography>
                <Typography
                  variant="caption"
                  color={colors[mode].semantic.warning.primary}
                  sx={{ display: 'flex', flex: '1' }}
                >
                  <FormattedMessage
                    description="positionagEURNotSupported"
                    defaultMessage="Due to Euler's security breach, the Angle protocol has been paused. As a consequence, oracles and swaps cannot operate reliably and have been halted."
                  />
                </Typography>
              </StyledDetailWrapper>
            ))}
          {(!!position.from.underlyingTokens.length || !!position.to.underlyingTokens.length) &&
            position.chainId === 1 && (
              <StyledDetailWrapper alignItems="flex-start">
                <Typography
                  variant="bodySmall"
                  color={colors[mode].semantic.warning.primary}
                  sx={{ display: 'flex', marginTop: '2px' }}
                >
                  <ErrorOutlineIcon fontSize="inherit" />
                </Typography>
                <Typography variant="caption" color={colors[mode].semantic.warning.primary} sx={{ flex: '1' }}>
                  <FormattedMessage
                    description="positionEulerHack1"
                    defaultMessage="Euler has frozen the contracts after the hack, so modifying positions or withdrawing is not possible at the moment. You might be entitled to claim compensation, to do this visit the"
                  />
                  <StyledLink href="https://mean.finance/euler-claim" target="_blank">
                    <FormattedMessage description="EulerClaim ClaimPage" defaultMessage="claim page" />
                  </StyledLink>
                </Typography>
              </StyledDetailWrapper>
            )}
          {(AAVE_FROZEN_TOKENS.includes(foundYieldTo?.tokenAddress.toLowerCase() || '') ||
            AAVE_FROZEN_TOKENS.includes(foundYieldFrom?.tokenAddress.toLowerCase() || '')) && (
            <StyledDetailWrapper alignItems="flex-start">
              <Typography variant="body2" color="#db9e00" sx={{ display: 'flex', marginTop: '2px' }}>
                <ErrorOutlineIcon fontSize="inherit" />
              </Typography>
              <Typography variant="caption" color="#db9e00" sx={{ flex: '1' }}>
                <FormattedMessage
                  description="positionAaveVulnerability"
                  defaultMessage="Due to recent updates, Aave has temporarily suspended certain lending and borrowing pools. Rest assured, no funds are at risk and Aave’s DAO already has a governance proposal to re-enable safely previously affected pools. However, during this period, you won’t be able to interact with your position and we won’t be able to execute the swaps. For a comprehensive understanding of Aave’s decision,"
                />
                <StyledLink
                  href="https://governance.aave.com/t/aave-v2-v3-security-incident-04-11-2023/15335/1"
                  target="_blank"
                >
                  <FormattedMessage
                    description="clickhereForAnnouncement"
                    defaultMessage="click here to read their official announcement."
                  />
                </StyledLink>
              </Typography>
            </StyledDetailWrapper>
          )}
        </StyledContentContainer>
        {remainingSwaps > 0n && (
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
                swaps={Number(remainingSwaps)}
                variant="determinate"
                value={Number(100n * ((totalSwaps - remainingSwaps) / totalSwaps))}
              />
            </StyledProgressWrapper>
          </DarkTooltip>
        )}
        <PositionCardButton
          position={position}
          handleOnWithdraw={handleOnWithdraw}
          onReusePosition={onReusePosition}
          onMigrateYield={onMigrateYield}
          disabled={disabled}
          hasSignSupport={!!hasSignSupport}
          yieldOptions={yieldOptions}
          onSuggestMigrateYield={onSuggestMigrateYield}
          walletIsConnected={walletIsConnected}
          showSwitchAction={showSwitchAction}
        />
      </CardContent>
    </StyledCard>
  );
};
export default ActivePosition;
