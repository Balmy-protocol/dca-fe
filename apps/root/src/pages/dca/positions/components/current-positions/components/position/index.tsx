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
  ErrorOutlineIcon,
  colors,
  ArrowRightIcon,
  ContainerBox,
  baseColors,
  PositionProgressBar,
} from 'ui-library';
import styled from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';
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

import { formatCurrencyAmount, getNetworkCurrencyTokens } from '@common/utils/currency';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import useUsdPrice from '@hooks/useUsdPrice';
import PositionCardButton from '../position-card-button';
import Address from '@common/components/address';
import { capitalize } from 'lodash';
import useTrackEvent from '@hooks/useTrackEvent';
import PositionOptions from '../position-options';
import useWallet from '@hooks/useWallet';
import useWalletNetwork from '@hooks/useWalletNetwork';

const StyledCard = styled(Card)`
  ${({ theme: { spacing } }) => `
  padding: ${spacing(8)};
  width: 100%;
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

const StyledLink = styled(Link)`
  margin: 0px 5px;
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

  const remainingLiquidity = totalRemainingLiquidity - (yieldFromGenerated || 0n);

  const [toPrice, isLoadingToPrice] = useUsdPrice(to, toWithdraw);
  const [fromPrice, isLoadingFromPrice] = useUsdPrice(from, totalRemainingLiquidity);

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
              <Typography variant="bodySmall">
                <Address address={position.user} trimAddress trimSize={4} />
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
                        {formatCurrencyAmount(BigInt(toWithdraw), position.to, 4)}
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
              {!isPending && hasNoFunds && !isOldVersion && (toWithdraw > 0n || remainingSwaps > 0n) && (
                <Typography variant="bodySmall" fontWeight={700} color="success.dark">
                  <FormattedMessage description="finishedPosition" defaultMessage="Finished" />
                </Typography>
              )}
              {!isPending && hasNoFunds && !isOldVersion && toWithdraw <= 0n && remainingSwaps <= 0n && (
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
                        {formatCurrencyAmount(totalRemainingLiquidity, position.from, 4)}
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
                <PositionProgressBar value={Number((100n * (totalSwaps - remainingSwaps)) / totalSwaps)} />
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
          {((position.from.symbol === 'CRV' && foundYieldFrom) || (position.to.symbol === 'CRV' && foundYieldTo)) && (
            <ContainerBox alignItems="flex-start" gap={1}>
              <ErrorOutlineIcon fontSize="small" color="warning" />
              <Typography variant="bodySmall" color="warning.dark">
                <FormattedMessage
                  description="positionCRVNotSupported"
                  defaultMessage="Unfortunately, the CRV token can no longer be used as collateral on Aave V3. This means that it's not possible to swap this position."
                />
              </Typography>
            </ContainerBox>
          )}
          {(position.from.symbol === 'UNIDX' || position.to.symbol === 'UNIDX') && (
            <ContainerBox alignItems="flex-start" gap={1}>
              <ErrorOutlineIcon fontSize="small" color="warning" />
              <Typography variant="bodySmall" color="warning.dark">
                <FormattedMessage
                  description="positionUNIDXNotSupported"
                  defaultMessage="$UNIDX liquidity has been moved out of Uniswap, thus rendering the oracle unreliable. Swaps have been paused until a reliable oracle for $UNIDX is available"
                />
              </Typography>
            </ContainerBox>
          )}
          {position.from.symbol === 'LPT' && (
            <ContainerBox alignItems="flex-start" gap={1}>
              <ErrorOutlineIcon fontSize="small" color="warning" />
              <Typography variant="bodySmall" color="warning.dark">
                <FormattedMessage
                  description="positionLPTNotSupported"
                  defaultMessage="Livepeer liquidity on Arbitrum has decreased significantly, so adding funds is disabled until this situation has reverted."
                />
              </Typography>
            </ContainerBox>
          )}
          {position.from.symbol === 'jEUR' && foundYieldFrom && (
            <ContainerBox alignItems="flex-start" gap={1}>
              <ErrorOutlineIcon fontSize="small" color="warning" />
              <Typography variant="bodySmall" color="warning.dark">
                <FormattedMessage
                  description="positionJEURNotSupported"
                  defaultMessage="Due to the latest developments Aave has paused the $jEUR lending and borrowing. As a result, increasing the position has been disabled. Read more about this here"
                />
                <StyledLink href="https://app.aave.com/governance/proposal/?proposalId=143" target="_blank">
                  <FormattedMessage description="here" defaultMessage="here." />
                </StyledLink>
              </Typography>
            </ContainerBox>
          )}
          {position.from.symbol === 'agEUR' ||
            (position.to.symbol === 'agEUR' && (
              <ContainerBox alignItems="flex-start" gap={1}>
                <ErrorOutlineIcon fontSize="small" color="warning" />
                <Typography variant="bodySmall" color="warning.dark">
                  <FormattedMessage
                    description="positionagEURNotSupported"
                    defaultMessage="Due to Euler's security breach, the Angle protocol has been paused. As a consequence, oracles and swaps cannot operate reliably and have been halted."
                  />
                </Typography>
              </ContainerBox>
            ))}
          {(!!position.from.underlyingTokens.length || !!position.to.underlyingTokens.length || true) &&
            position.chainId === 1 && (
              <ContainerBox alignItems="flex-start" gap={1}>
                <ErrorOutlineIcon fontSize="small" color="warning" />
                <Typography variant="bodySmall" color="warning.dark">
                  <FormattedMessage
                    description="positionEulerHack1"
                    defaultMessage="Euler has frozen the contracts after the hack, so modifying positions or withdrawing is not possible at the moment. You might be entitled to claim compensation, to do this visit the"
                  />
                  <StyledLink href="https://mean.finance/euler-claim" target="_blank">
                    <FormattedMessage description="EulerClaim ClaimPage" defaultMessage="claim page" />
                  </StyledLink>
                </Typography>
              </ContainerBox>
            )}
          {(AAVE_FROZEN_TOKENS.includes(foundYieldTo?.tokenAddress.toLowerCase() || '') ||
            AAVE_FROZEN_TOKENS.includes(foundYieldFrom?.tokenAddress.toLowerCase() || '')) && (
            <ContainerBox alignItems="flex-start" gap={1}>
              <ErrorOutlineIcon fontSize="small" color="warning" />
              <Typography variant="bodySmall" color="warning.dark">
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
            </ContainerBox>
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
        </ContainerBox>
      </CardContent>
    </StyledCard>
  );
};
export default ActivePosition;
