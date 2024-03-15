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
  baseColors,
  PositionProgressBar,
  Button,
} from 'ui-library';
import styled from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';
import TokenIcon from '@common/components/token-icon';
import { getFrequencyLabel, getTimeFrequencyLabel } from '@common/utils/parsing';
import { ChainId, Position, Token, WalletStatus, YieldOptions } from '@types';
import {
  CHAIN_CHANGING_WALLETS_WITHOUT_REFRESH,
  NETWORKS,
  STRING_SWAP_INTERVALS,
  TESTNETS,
  VERSIONS_ALLOWED_MODIFY,
} from '@constants';

import { formatCurrencyAmount, getNetworkCurrencyTokens } from '@common/utils/currency';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import useUsdPrice from '@hooks/useUsdPrice';
import PositionCardButton from '../current-positions/components/position-card-button';
import Address from '@common/components/address';
import { capitalize } from 'lodash';
import useTrackEvent from '@hooks/useTrackEvent';
import PositionOptions from '../current-positions/components/position-options';
import useWallet from '@hooks/useWallet';
import useWalletNetwork from '@hooks/useWalletNetwork';
import { useAppDispatch } from '@state/hooks';
import usePushToHistory from '@hooks/usePushToHistory';
import { setPosition } from '@state/position-details/actions';
import { useThemeMode } from '@state/config/hooks';
import PositionWarning from './components/position-warning';

const StyledCard = styled(Card)`
  ${({ theme: { spacing } }) => `
  padding: ${spacing(8)};
  width: 100%;
  display: flex;
  box-shadow: ${baseColors.dropShadow.dropShadow300};
  :hover {
  box-shadow: ${baseColors.dropShadow.dropShadow200};
  }
  `}
`;

const StyledCardHeader = styled(ContainerBox).attrs({ justifyContent: 'space-between', gap: 1 })`
  ${({ theme: { spacing, palette } }) => `
  padding-bottom: ${spacing(4.5)};
  border-bottom: 1px solid ${colors[palette.mode].border.border2};
  `}
`;

const StyledBodySmallTypography = styled(Typography).attrs({ variant: 'bodySmall' })`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo2}
  `}
`;

interface PositionProp extends Omit<Position, 'from' | 'to'> {
  from: Token;
  to: Token;
}

interface TerminatedPositionProps {
  position: Position;
}

export const TerminatedPosition = ({ position }: TerminatedPositionProps) => {
  const { from, to, swapInterval, swapped, totalExecutedSwaps, chainId } = position;
  const mode = useThemeMode();

  const intl = useIntl();
  const positionNetwork = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const supportedNetwork = find(NETWORKS, { chainId })!;
    return supportedNetwork;
  }, [chainId]);

  const pushToHistory = usePushToHistory();
  const [toPrice, isLoadingToPrice] = useUsdPrice(to, swapped.amount, undefined);
  const showToPrice = !isLoadingToPrice && !!toPrice;
  const dispatch = useAppDispatch();

  const { mainCurrencyToken } = getNetworkCurrencyTokens(positionNetwork);

  const onViewDetails = () => {
    dispatch(setPosition(undefined));
    pushToHistory(`/${chainId}/positions/${position.version}/${position.positionId}`);
  };
  return (
    <StyledCard variant="outlined">
      <CardContent>
        <ContainerBox gap={6} flexDirection="column">
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
              <Typography variant="bodySmall" maxWidth={'7ch'} textOverflow="ellipsis" overflow="hidden">
                <Address address={position.user} />
              </Typography>
              <Typography variant="bodySmall">
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
              <TokenIcon token={mainCurrencyToken} size={8} />
            </ContainerBox>
          </StyledCardHeader>
          <ContainerBox flexDirection="column" gap={1}>
            <Typography variant="bodySmall">
              <FormattedMessage description="history run for in position" defaultMessage="Run for" />
            </Typography>
            {totalExecutedSwaps > 0n ? (
              <StyledBodySmallTypography fontWeight={700}>
                {getFrequencyLabel(intl, swapInterval.toString(), totalExecutedSwaps.toString())}
              </StyledBodySmallTypography>
            ) : (
              <StyledBodySmallTypography fontWeight={700}>
                <FormattedMessage description="history never run for in position" defaultMessage="Never executed" />
              </StyledBodySmallTypography>
            )}
          </ContainerBox>
          <ContainerBox flexDirection="column" gap={1}>
            <Typography variant="bodySmall">
              <FormattedMessage description="history swapped in position" defaultMessage="Swapped" />
            </Typography>

            <Tooltip
              title={showToPrice && <StyledBodySmallTypography>${toPrice.toFixed(2)}</StyledBodySmallTypography>}
            >
              <Typography
                variant="bodySmall"
                fontWeight={700}
                color={swapped.amount > 0n ? colors[mode].typography.typo2 : colors[mode].typography.typo3}
              >
                {formatCurrencyAmount(swapped.amount, to, 4)} {to.symbol}
              </Typography>
            </Tooltip>
          </ContainerBox>
          <ContainerBox fullWidth justifyContent="center">
            <Button variant="outlined" onClick={onViewDetails} fullWidth>
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
  onMigrateYield: (position: Position) => void;
  onTerminate: (position: Position) => void;
  onSuggestMigrateYield: (position: Position) => void;
  disabled: boolean;
  hasSignSupport: boolean;
  yieldOptionsByChain: Record<ChainId, YieldOptions>;
}

export const OpenPosition = ({
  position,
  onWithdraw,
  onReusePosition,
  onMigrateYield,
  onSuggestMigrateYield,
  disabled,
  hasSignSupport,
  onTerminate,
  yieldOptionsByChain,
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
  const positionNetwork = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const supportedNetwork = find(NETWORKS, { chainId })!;
    return supportedNetwork;
  }, [chainId]);
  const yieldOptions = yieldOptionsByChain[chainId];

  const intl = useIntl();
  const trackEvent = useTrackEvent();
  const wallet = useWallet(user);

  const remainingLiquidity = totalRemainingLiquidity.amount - (yieldFromGenerated?.amount || 0n);

  const [toPrice, isLoadingToPrice] = useUsdPrice(to, toWithdraw.amount);
  const [fromPrice, isLoadingFromPrice] = useUsdPrice(from, totalRemainingLiquidity.amount);

  const showToPrice = !isLoadingToPrice && !!toPrice;
  const showFromPrice = !isLoadingFromPrice && !!fromPrice;

  const isPending = !!pendingTransaction;

  const hasNoFunds = remainingLiquidity <= 0n;

  const isOldVersion = !VERSIONS_ALLOWED_MODIFY.includes(position.version);

  const [connectedNetwork] = useWalletNetwork(user);
  const isOnNetwork = connectedNetwork?.chainId === positionNetwork.chainId;
  const walletIsConnected = wallet.status === WalletStatus.connected;
  const showSwitchAction =
    walletIsConnected && !isOnNetwork && !CHAIN_CHANGING_WALLETS_WITHOUT_REFRESH.includes(wallet.providerInfo.name);

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
              <ContainerBox gap={2}>
                <ComposedTokenIcon tokenBottom={from} tokenTop={to} size={8} />
                <ContainerBox gap={0.5} alignItems="center">
                  <Typography variant="body">{from.symbol}</Typography>
                  <ArrowRightIcon fontSize="small" />
                  <Typography variant="body">{to.symbol}</Typography>
                </ContainerBox>
              </ContainerBox>
              <ContainerBox gap={4} alignItems="center">
                <Typography variant="bodySmall" maxWidth={'7ch'} textOverflow="ellipsis" overflow="hidden">
                  <Address address={position.user} />
                </Typography>
                <Typography variant="bodySmall">
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
            <ContainerBox flexDirection="column" gap={3}>
              <ContainerBox justifyContent="space-between" fullWidth alignItems="end">
                <ContainerBox flexDirection="column" gap={1}>
                  <Typography variant="bodySmall">
                    <FormattedMessage description="positionDetailsToWithdrawTitle" defaultMessage="To withdraw" />
                  </Typography>
                  <ContainerBox>
                    <Tooltip
                      title={
                        showToPrice && (
                          <StyledBodySmallTypography fontWeight={700}>${toPrice.toFixed(2)}</StyledBodySmallTypography>
                        )
                      }
                    >
                      <ContainerBox gap={1} alignItems="center">
                        <TokenIcon isInChip size={7} token={position.to} />
                        <Typography variant="bodyLarge" fontWeight={700} lineHeight={1}>
                          {formatCurrencyAmount(toWithdraw.amount, position.to, 4)}
                        </Typography>
                      </ContainerBox>
                    </Tooltip>
                  </ContainerBox>
                </ContainerBox>
                {!isPending && !hasNoFunds && !isStale && (
                  <Typography variant="bodySmall" fontWeight={700}>
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
                  <Typography variant="bodySmall" fontWeight={700} color="success.dark">
                    <FormattedMessage description="finishedPosition" defaultMessage="Finished" />
                  </Typography>
                )}
                {!isPending && hasNoFunds && !isOldVersion && toWithdraw.amount <= 0n && remainingSwaps <= 0n && (
                  <Typography variant="bodySmall" fontWeight={700} color="success.dark">
                    <FormattedMessage description="donePosition" defaultMessage="Done" />
                  </Typography>
                )}
                {!isPending && !hasNoFunds && isStale && !isOldVersion && (
                  <Typography variant="bodySmall" fontWeight={700} color="warning.dark">
                    <FormattedMessage description="stale" defaultMessage="Stale" />
                  </Typography>
                )}
                {isOldVersion && hasNoFunds && (
                  <Typography variant="bodySmall" fontWeight={700} color="warning.dark">
                    <FormattedMessage description="deprecated" defaultMessage="Deprecated" />
                  </Typography>
                )}
              </ContainerBox>
              <Tooltip
                title={
                  <ContainerBox flexDirection="column" gap={2.5}>
                    <ContainerBox flexDirection="column" gap={1}>
                      <StyledBodySmallTypography>
                        <FormattedMessage description="current remaining" defaultMessage="Remaining:" />
                      </StyledBodySmallTypography>
                      <ContainerBox gap={1} alignItems="center">
                        <TokenIcon size={5} token={from} />
                        <StyledBodySmallTypography fontWeight={700}>
                          {formatCurrencyAmount(totalRemainingLiquidity.amount, position.from, 4)}
                        </StyledBodySmallTypography>
                        {showFromPrice && (
                          <>
                            <StyledBodySmallTypography fontWeight={700}>·</StyledBodySmallTypography>
                            <Typography variant="bodySmall">${fromPrice.toFixed(2)}</Typography>
                          </>
                        )}
                      </ContainerBox>
                    </ContainerBox>
                    {remainingSwaps > 0n && (
                      <ContainerBox gap={1}>
                        <StyledBodySmallTypography>
                          <FormattedMessage description="positionDetailsNextSwapTitle" defaultMessage="Next swap:" />
                        </StyledBodySmallTypography>
                        {DateTime.now().toSeconds() < DateTime.fromSeconds(position.nextSwapAvailableAt).toSeconds() ? (
                          <StyledBodySmallTypography fontWeight={700}>
                            {DateTime.fromSeconds(position.nextSwapAvailableAt).toRelative()}
                          </StyledBodySmallTypography>
                        ) : (
                          <StyledBodySmallTypography fontWeight={700}>
                            <FormattedMessage
                              description="positionDetailsNextSwapInProgress"
                              defaultMessage="in progress"
                            />
                          </StyledBodySmallTypography>
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
            <PositionWarning position={position} yieldOptions={yieldOptions} />
          </ContainerBox>
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
        </ContainerBox>
      </CardContent>
    </StyledCard>
  );
};
