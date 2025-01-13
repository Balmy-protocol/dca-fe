import * as React from 'react';
import find from 'lodash/find';
import { DateTime } from 'luxon';
import {
  Chip,
  Typography,
  Tooltip,
  Card,
  CardContent,
  colors,
  ArrowRightIcon,
  ContainerBox,
  PositionProgressBar,
  Button,
  BackgroundPaper,
  Skeleton,
  MoreVertIcon,
  IconButton,
  Hidden,
  HiddenNumber,
} from 'ui-library';
import styled from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';
import TokenIcon from '@common/components/token-icon';
import { getFrequencyLabel, getTimeFrequencyLabel } from '@common/utils/parsing';
import { Position, Token, WalletStatus } from '@types';
import {
  CHAIN_CHANGING_WALLETS_WITH_REFRESH,
  NETWORKS,
  STRING_SWAP_INTERVALS,
  TESTNETS,
  VERSIONS_ALLOWED_MODIFY,
} from '@constants';

import {
  formatCurrencyAmount,
  formatUsdAmount,
  getNetworkCurrencyTokens,
  parseNumberUsdPriceToBigInt,
  parseUsdPrice,
} from '@common/utils/currency';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import PositionCardButton from '../current-positions/components/position-card-button';
import Address from '@common/components/address';
import { capitalize } from 'lodash';
import useAnalytics from '@hooks/useAnalytics';
import PositionOptions from '../current-positions/components/position-options';
import useWallet from '@hooks/useWallet';
import useWalletNetwork from '@hooks/useWalletNetwork';
import { useAppDispatch } from '@state/hooks';
import usePushToHistory from '@hooks/usePushToHistory';
import { setPosition } from '@state/position-details/actions';
import { useShowBalances, useThemeMode } from '@state/config/hooks';
import PositionWarning from './components/position-warning';

const StyledCard = styled(Card)`
  ${({
    theme: {
      spacing,
      palette: { mode },
    },
  }) => `
  padding: ${spacing(8)};
  width: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: ${colors[mode].dropShadow.dropShadow300};
  :hover {
  box-shadow: ${colors[mode].dropShadow.dropShadow200};
  }
  `}
`;

const StyledCardHeader = styled(ContainerBox).attrs({ justifyContent: 'space-between', gap: 1 })`
  ${({ theme: { spacing, palette } }) => `
  padding-bottom: ${spacing(4.5)};
  border-bottom: 1px solid ${colors[palette.mode].border.border2};
  `}
`;

const StyledBodySmallRegularTypography = styled(Typography).attrs({ variant: 'bodySmallRegular' })`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo2}
  `}
`;
const StyledBodySmallBoldTypography = styled(Typography).attrs({ variant: 'bodySmallBold' })`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo2}
  `}
`;

const StyledSkeletonContainer = styled(BackgroundPaper).attrs({ variant: 'outlined' })`
  width: 100%;
  display: flex;
  flex-direction: column;
  ${({ theme }) => `gap: ${theme.spacing(6)}`}
`;

export const PositionCardSkeleton = ({ isClosed }: { isClosed?: boolean }) => (
  <StyledSkeletonContainer>
    <StyledCardHeader>
      <ContainerBox gap={2} alignItems="center">
        <ComposedTokenIcon isLoading size={8} marginRight={5} />
        <Typography variant="bodyRegular">
          <Skeleton width="8ch" animation="wave" />
        </Typography>
      </ContainerBox>
      <ContainerBox gap={4} alignItems="center">
        <Typography variant="bodyRegular">
          <Skeleton width="4ch" animation="wave" />
        </Typography>
        <Typography variant="bodyRegular">
          <Skeleton width="4ch" animation="wave" />
        </Typography>
        <Skeleton variant="circular" animation="wave" height={32} width={32} />
        {!isClosed && (
          <IconButton disabled size="small">
            <MoreVertIcon color="disabled" />
          </IconButton>
        )}
      </ContainerBox>
    </StyledCardHeader>
    <ContainerBox flexDirection="column" gap={2} fullWidth>
      <ContainerBox flexDirection="column" fullWidth>
        <Typography variant="bodySmallRegular">
          <Skeleton variant="text" animation="wave" width="4ch" />
        </Typography>
        <Typography variant="h4Bold">
          <Skeleton variant="text" animation="wave" width="100%" />
        </Typography>
      </ContainerBox>
      <Typography variant="bodySmallRegular">
        <Skeleton variant="text" animation="wave" width="100%" />
      </Typography>
    </ContainerBox>
    <ContainerBox fullWidth justifyContent="center">
      <Button variant="outlined" fullWidth disabled>
        <Skeleton variant="text" animation="wave" width="8ch" />
      </Button>
    </ContainerBox>
  </StyledSkeletonContainer>
);

interface PositionProp extends DistributiveOmit<Position, 'from' | 'to'> {
  from: Token;
  to: Token;
}

interface TerminatedPositionProps {
  position: Position;
}

export const TerminatedPosition = ({ position }: TerminatedPositionProps) => {
  const { from, to, swapInterval, swapped, totalExecutedSwaps, chainId } = position;
  const mode = useThemeMode();
  const { trackEvent } = useAnalytics();

  const intl = useIntl();
  const positionNetwork = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const supportedNetwork = find(NETWORKS, { chainId })!;
    return supportedNetwork;
  }, [chainId]);

  const pushToHistory = usePushToHistory();

  const toUsdValue = parseUsdPrice(to, swapped.amount, parseNumberUsdPriceToBigInt(to.price));

  const dispatch = useAppDispatch();

  const { mainCurrencyToken } = getNetworkCurrencyTokens(positionNetwork);

  const onViewDetails = () => {
    dispatch(setPosition(undefined));
    pushToHistory(`/invest/positions/${chainId}/${position.version}/${position.positionId}`);
    trackEvent('Position List - Go to position details', {
      chainId: position.chainId,
    });
  };

  return (
    <StyledCard variant="outlined">
      <CardContent>
        <ContainerBox gap={6} flexDirection="column">
          <StyledCardHeader>
            <ContainerBox gap={2}>
              <ComposedTokenIcon tokens={[from, to]} size={8} marginRight={5} />
              <ContainerBox gap={0.5} alignItems="center">
                <Typography variant="bodyRegular">{from.symbol}</Typography>
                <ArrowRightIcon fontSize="small" />
                <Typography variant="bodyRegular">{to.symbol}</Typography>
              </ContainerBox>
            </ContainerBox>
            <ContainerBox gap={4} alignItems="center">
              <Hidden mdDown>
                <Typography variant="bodySmallRegular" maxWidth={'7ch'} textOverflow="ellipsis" overflow="hidden">
                  <Address address={position.user} />
                </Typography>
                <Typography variant="bodySmallRegular">
                  <FormattedMessage
                    description="positionFrequencyAdverb"
                    defaultMessage="{frequency}"
                    values={{
                      frequency: capitalize(
                        intl.formatMessage(
                          STRING_SWAP_INTERVALS[position.swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS]
                            .adverb
                        )
                      ),
                    }}
                  />
                </Typography>
              </Hidden>
              <TokenIcon token={mainCurrencyToken} size={8} />
            </ContainerBox>
          </StyledCardHeader>
          <ContainerBox flexDirection="column" gap={1}>
            <Typography variant="bodySmallRegular">
              <FormattedMessage description="history run for in position" defaultMessage="Run for" />
            </Typography>
            {totalExecutedSwaps > 0n ? (
              <StyledBodySmallBoldTypography>
                {getFrequencyLabel(intl, swapInterval.toString(), totalExecutedSwaps.toString())}
              </StyledBodySmallBoldTypography>
            ) : (
              <StyledBodySmallBoldTypography>
                <FormattedMessage description="history never run for in position" defaultMessage="Never executed" />
              </StyledBodySmallBoldTypography>
            )}
          </ContainerBox>
          <ContainerBox flexDirection="column" gap={1}>
            <Typography variant="bodySmallRegular">
              <FormattedMessage description="history swapped in position" defaultMessage="Swapped" />
            </Typography>

            <Tooltip
              title={
                <StyledBodySmallRegularTypography>
                  ${formatUsdAmount({ amount: toUsdValue, intl })}
                </StyledBodySmallRegularTypography>
              }
            >
              <Typography
                variant="bodySmallBold"
                color={swapped.amount > 0n ? colors[mode].typography.typo2 : colors[mode].typography.typo3}
              >
                {formatCurrencyAmount({ amount: swapped.amount, token: to, sigFigs: 4, intl })} {to.symbol}
              </Typography>
            </Tooltip>
          </ContainerBox>
          <ContainerBox fullWidth justifyContent="center">
            <Button variant="outlined" onClick={onViewDetails} fullWidth size="large">
              <FormattedMessage description="goToPosition" defaultMessage="Go to position" />
            </Button>
          </ContainerBox>
        </ContainerBox>
      </CardContent>
    </StyledCard>
  );
};

interface OpenPositionProps {
  position: PositionProp;
  onWithdraw: (position: Position, useProtocolToken?: boolean) => void;
  onReusePosition: (position: Position) => void;
  onTerminate: (position: Position) => void;
  disabled: boolean;
  hasSignSupport: boolean;
}

export const OpenPosition = ({
  position,
  onWithdraw,
  onReusePosition,
  disabled,
  hasSignSupport,
  onTerminate,
}: OpenPositionProps) => {
  const {
    from,
    to,
    swapInterval,
    remainingLiquidity: totalRemainingLiquidity,
    remainingSwaps,
    totalSwaps,
    pendingTransaction,
    toWithdraw,
    chainId,
    isStale,
    remainingLiquidityYield: yieldFromGenerated,
    user,
  } = position;
  const showBalance = useShowBalances();
  const positionNetwork = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const supportedNetwork = find(NETWORKS, { chainId })!;
    return supportedNetwork;
  }, [chainId]);

  const intl = useIntl();
  const { trackEvent } = useAnalytics();
  const wallet = useWallet(user);

  const remainingLiquidity = totalRemainingLiquidity.amount - (yieldFromGenerated?.amount || 0n);

  const fromUsdValue = parseUsdPrice(from, totalRemainingLiquidity.amount, parseNumberUsdPriceToBigInt(from.price));
  const toUsdValue = parseUsdPrice(to, toWithdraw.amount, parseNumberUsdPriceToBigInt(to.price));

  const isPending = !!pendingTransaction;

  const hasNoFunds = remainingLiquidity <= 0n;

  const isOldVersion = !VERSIONS_ALLOWED_MODIFY.includes(position.version);

  const connectedNetwork = useWalletNetwork(user);
  const isOnNetwork = connectedNetwork?.chainId === positionNetwork.chainId;
  const walletIsConnected = wallet?.status === WalletStatus.connected;
  const showSwitchAction =
    walletIsConnected && !isOnNetwork && CHAIN_CHANGING_WALLETS_WITH_REFRESH.includes(wallet.providerInfo?.name || '');

  const isTestnet = TESTNETS.includes(positionNetwork.chainId);

  const { mainCurrencyToken } = getNetworkCurrencyTokens(positionNetwork);

  const handleOnWithdraw = (useProtocolToken: boolean) => {
    onWithdraw(position, useProtocolToken);
    trackEvent('DCA - Position List - Withdraw', { useProtocolToken });
  };

  return (
    <StyledCard variant="outlined">
      <CardContent>
        <ContainerBox gap={6} flexDirection="column" justifyContent="space-between" flexGrow={1}>
          <ContainerBox gap={6} flexDirection="column">
            <StyledCardHeader>
              <ContainerBox gap={2} alignItems="center">
                <ComposedTokenIcon tokens={[from, to]} size={8} marginRight={5} />
                <ContainerBox gap={0.5} alignItems="center">
                  <Typography variant="bodySemibold">{from.symbol}</Typography>
                  <ArrowRightIcon fontSize="small" />
                  <Typography variant="bodySemibold">{to.symbol}</Typography>
                </ContainerBox>
              </ContainerBox>
              <ContainerBox gap={4} alignItems="center">
                <Hidden mdDown>
                  <Typography variant="bodySmallRegular" maxWidth={'15ch'} textOverflow="ellipsis" overflow="hidden">
                    <Address address={position.user} />
                  </Typography>
                </Hidden>
                <TokenIcon token={mainCurrencyToken} size={8} />
                <PositionOptions
                  position={position}
                  disabled={disabled}
                  walletIsConnected={walletIsConnected}
                  onTerminate={onTerminate}
                  handleOnWithdraw={handleOnWithdraw}
                  hasSignSupport={!!hasSignSupport}
                  showSwitchAction={showSwitchAction}
                />
              </ContainerBox>
            </StyledCardHeader>
            <ContainerBox flexDirection="column" gap={3}>
              <ContainerBox justifyContent="space-between" fullWidth alignItems="end">
                <ContainerBox flexDirection="column" gap={1}>
                  <Typography variant="bodySmallRegular">
                    <FormattedMessage description="positionDetailsToWithdrawTitle" defaultMessage="To withdraw" />
                  </Typography>
                  <ContainerBox>
                    <Tooltip
                      title={
                        <StyledBodySmallBoldTypography>
                          ${formatUsdAmount({ amount: toUsdValue, intl })}
                        </StyledBodySmallBoldTypography>
                      }
                    >
                      <ContainerBox gap={1} alignItems="center">
                        <TokenIcon isInChip size={8} token={position.to} />
                        {showBalance ? (
                          <Typography variant="h3Bold" lineHeight={1}>
                            {formatCurrencyAmount({ amount: toWithdraw.amount, token: position.to, sigFigs: 4, intl })}
                          </Typography>
                        ) : (
                          <HiddenNumber size="large" />
                        )}
                      </ContainerBox>
                    </Tooltip>
                  </ContainerBox>
                </ContainerBox>
                {!isPending && !hasNoFunds && !isStale && (
                  <Typography variant="bodySmallBold">
                    <FormattedMessage
                      description="days to finish"
                      defaultMessage="{type} left"
                      values={{
                        type: getTimeFrequencyLabel(intl, swapInterval.toString(), remainingSwaps.toString()),
                      }}
                    />
                  </Typography>
                )}
                {!isPending && hasNoFunds && !isOldVersion && (toWithdraw.amount > 0n || remainingSwaps > 0n) && (
                  <Typography variant="bodySmallRegular" color="success.dark">
                    <FormattedMessage description="finishedPosition" defaultMessage="Finished" />
                  </Typography>
                )}
                {!isPending && hasNoFunds && !isOldVersion && toWithdraw.amount <= 0n && remainingSwaps <= 0n && (
                  <Typography variant="bodySmallRegular" color="success.dark">
                    <FormattedMessage description="donePosition" defaultMessage="Done" />
                  </Typography>
                )}
                {!isPending && !hasNoFunds && isStale && !isOldVersion && (
                  <Typography variant="bodySmallRegular" color="warning.dark">
                    <FormattedMessage description="stale" defaultMessage="Stale" />
                  </Typography>
                )}
                {isOldVersion && hasNoFunds && (
                  <Typography variant="bodySmallRegular" color="warning.dark">
                    <FormattedMessage description="deprecated" defaultMessage="Deprecated" />
                  </Typography>
                )}
              </ContainerBox>
              <Tooltip
                title={
                  <ContainerBox flexDirection="column" gap={2.5}>
                    <ContainerBox flexDirection="column" gap={1}>
                      <StyledBodySmallRegularTypography>
                        <FormattedMessage description="current remaining" defaultMessage="Remaining:" />
                      </StyledBodySmallRegularTypography>
                      <ContainerBox gap={1} alignItems="center">
                        <TokenIcon size={5} token={from} />
                        <StyledBodySmallBoldTypography>
                          {formatCurrencyAmount({
                            amount: totalRemainingLiquidity.amount,
                            token: position.from,
                            sigFigs: 4,
                            intl,
                          })}
                        </StyledBodySmallBoldTypography>
                        <StyledBodySmallBoldTypography>·</StyledBodySmallBoldTypography>
                        <Typography variant="bodySmallRegular">
                          ${formatUsdAmount({ amount: fromUsdValue, intl })}
                        </Typography>
                      </ContainerBox>
                    </ContainerBox>
                    {remainingSwaps > 0n && (
                      <ContainerBox gap={1}>
                        <StyledBodySmallRegularTypography>
                          <FormattedMessage description="positionDetailsNextSwapTitle" defaultMessage="Next swap:" />
                        </StyledBodySmallRegularTypography>
                        {DateTime.now().toSeconds() < DateTime.fromSeconds(position.nextSwapAvailableAt).toSeconds() ? (
                          <StyledBodySmallBoldTypography>
                            {DateTime.fromSeconds(position.nextSwapAvailableAt).toRelative()}
                          </StyledBodySmallBoldTypography>
                        ) : (
                          <StyledBodySmallBoldTypography>
                            <FormattedMessage
                              description="positionDetailsNextSwapInProgress"
                              defaultMessage="in progress"
                            />
                          </StyledBodySmallBoldTypography>
                        )}
                      </ContainerBox>
                    )}
                  </ContainerBox>
                }
              >
                <div>
                  <PositionProgressBar
                    value={totalSwaps === 0n ? 0 : Number((100n * (totalSwaps - remainingSwaps)) / totalSwaps)}
                  />
                </div>
              </Tooltip>
            </ContainerBox>
            {isTestnet && (
              <ContainerBox alignItems="flex-start">
                <Chip
                  label={<FormattedMessage description="testnet" defaultMessage="Testnet" />}
                  size="small"
                  color="warning"
                />
              </ContainerBox>
            )}
            <PositionWarning position={position} />
          </ContainerBox>
          <PositionCardButton
            position={position}
            handleOnWithdraw={handleOnWithdraw}
            onReusePosition={onReusePosition}
            disabled={disabled}
            hasSignSupport={!!hasSignSupport}
            wallet={wallet}
            showSwitchAction={showSwitchAction}
          />
        </ContainerBox>
      </CardContent>
    </StyledCard>
  );
};
