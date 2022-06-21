import * as React from 'react';
import find from 'lodash/find';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import CardContent from '@mui/material/CardContent';
import Button from 'common/button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import TokenIcon from 'common/token-icon';
import { getTimeFrequencyLabel, sortTokens, calculateStale, STALE } from 'utils/parsing';
import { Position, Token } from 'types';
import { useHistory } from 'react-router-dom';
import { POSITION_VERSION_2, POSITION_VERSION_3, STABLE_COINS, STRING_SWAP_INTERVALS } from 'config/constants';
import useAvailablePairs from 'hooks/useAvailablePairs';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { createStyles } from '@mui/material/styles';
import { withStyles } from '@mui/styles';
import { BigNumber } from 'ethers';
import { formatCurrencyAmount } from 'utils/currency';
import { buildEtherscanTransaction } from 'utils/etherscan';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Link from '@mui/material/Link';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import useUsdPrice from 'hooks/useUsdPrice';
import CurrentPositionControls from '../position-control';

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

const StyledCard = styled(Card)`
  border-radius: 10px;
  position: relative;
  display: flex;
  flex-grow: 1;
  background: #292929;
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

const StyledDetailWrapper = styled.div<{ alignItems?: string }>`
  margin-bottom: 5px;
  display: flex;
  align-items: ${({ alignItems }) => alignItems || 'center'};
  justify-content: flex-start;
`;

const StyledProgressWrapper = styled.div`
  margin: 12px 0px;
`;

const StyledCardFooterButton = styled(Button)``;

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

const StyledCallToActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 8px;
`;

interface PositionProp extends Omit<Position, 'from' | 'to'> {
  from: Token;
  to: Token;
}

const POSITION_STATUSES = {
  FINISHED: 'FINISHED',
  ONGOING: 'ONGOING',
  TOWITHDRAW: 'TOWITHDRAW',
};

interface ActivePositionProps {
  position: PositionProp;
  onWithdraw: (position: Position, useProtocolToken?: boolean) => void;
  onTerminate: (position: Position) => void;
  onReusePosition: (position: Position) => void;
  onMigrate: (position: Position) => void;
  disabled: boolean;
}

const ActivePosition = ({
  position,
  onWithdraw,
  onReusePosition,
  onTerminate,
  onMigrate,
  disabled,
}: ActivePositionProps) => {
  const {
    from,
    to,
    swapInterval,
    remainingLiquidity,
    remainingSwaps,
    rate,
    totalSwaps,
    pendingTransaction,
    toWithdraw,
  } = position;
  const availablePairs = useAvailablePairs();
  const currentNetwork = useCurrentNetwork();
  const [toPrice, isLoadingToPrice] = useUsdPrice(to, toWithdraw);
  const history = useHistory();

  const isPending = !!pendingTransaction;
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
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
    calculateStale(pair?.lastExecutedAt || 0, swapInterval, position.startedAt, pair?.swapInfo || '1') === STALE;

  const onViewDetails = () => {
    history.push(`/positions/${position.id}`);
  };

  const isOldVersion = position.version !== POSITION_VERSION_3;

  let positionStatus;

  if (remainingSwaps.gt(BigNumber.from(0))) {
    positionStatus = POSITION_STATUSES.ONGOING;
  } else if (toWithdraw.gt(BigNumber.from(0))) {
    positionStatus = POSITION_STATUSES.TOWITHDRAW;
  } else {
    positionStatus = POSITION_STATUSES.FINISHED;
  }

  return (
    <StyledCard variant="outlined">
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
                  rate: formatCurrencyAmount(rate, from, 4),
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
        </StyledContentContainer>
        <StyledProgressWrapper>
          {remainingSwaps.toNumber() > 0 && (
            <BorderLinearProgress
              swaps={remainingSwaps.toNumber()}
              variant="determinate"
              value={100 * ((totalSwaps.toNumber() - remainingSwaps.toNumber()) / totalSwaps.toNumber())}
            />
          )}
        </StyledProgressWrapper>
        <StyledCallToActionContainer>
          {position.version === POSITION_VERSION_3 && (
            <>
              {isPending && (
                <StyledCardFooterButton variant="contained" color="pending" fullWidth>
                  <Link
                    href={buildEtherscanTransaction(pendingTransaction, currentNetwork.chainId)}
                    target="_blank"
                    rel="noreferrer"
                    underline="none"
                    color="inherit"
                  >
                    <Typography variant="body2" component="span">
                      <FormattedMessage description="pending transaction" defaultMessage="Pending transaction" />
                    </Typography>
                    <OpenInNewIcon style={{ fontSize: '1rem' }} />
                  </Link>
                </StyledCardFooterButton>
              )}
              {!isPending && (
                <>
                  {/* { (positionStatus === POSITION_STATUSES.ONGOING || positionStatus === POSITION_STATUSES.FINISHED) && ( */}
                  <StyledCardFooterButton variant="outlined" color="default" onClick={onViewDetails} fullWidth>
                    <Typography variant="body2">
                      <FormattedMessage description="goToPosition" defaultMessage="Go to position" />
                    </Typography>
                  </StyledCardFooterButton>
                  {/* )} */}
                  {positionStatus === POSITION_STATUSES.ONGOING && (
                    <>
                      <StyledCardFooterButton
                        variant="contained"
                        color="secondary"
                        onClick={() => onReusePosition(position)}
                        disabled={disabled}
                        fullWidth
                      >
                        <Typography variant="body2">
                          <FormattedMessage description="addFundsPosition" defaultMessage="Add funds" />
                        </Typography>
                      </StyledCardFooterButton>
                      <CurrentPositionControls position={position} disabled={disabled} onWithdraw={onWithdraw} />
                    </>
                  )}
                  {positionStatus === POSITION_STATUSES.TOWITHDRAW && (
                    <>
                      <StyledCardFooterButton
                        variant="contained"
                        color="secondary"
                        onClick={() => onReusePosition(position)}
                        disabled={disabled}
                        fullWidth
                      >
                        <Typography variant="body2">
                          <FormattedMessage description="reusePosition" defaultMessage="Reuse position" />
                        </Typography>
                      </StyledCardFooterButton>
                      <CurrentPositionControls position={position} disabled={disabled} onWithdraw={onWithdraw} />
                    </>
                  )}
                  {positionStatus === POSITION_STATUSES.FINISHED && (
                    <StyledCardFooterButton
                      variant="contained"
                      color="secondary"
                      onClick={() => onReusePosition(position)}
                      disabled={disabled}
                      fullWidth
                    >
                      <Typography variant="body2">
                        <FormattedMessage description="reusePosition" defaultMessage="Reuse position" />
                      </Typography>
                    </StyledCardFooterButton>
                  )}
                </>
              )}
            </>
          )}
          {position.version === POSITION_VERSION_2 && (
            <>
              {isPending && (
                <StyledCardFooterButton variant="contained" color="pending" fullWidth>
                  <Link
                    href={buildEtherscanTransaction(pendingTransaction, currentNetwork.chainId)}
                    target="_blank"
                    rel="noreferrer"
                    underline="none"
                    color="inherit"
                  >
                    <Typography variant="body2" component="span">
                      <FormattedMessage description="pending transaction" defaultMessage="Pending transaction" />
                    </Typography>
                    <OpenInNewIcon style={{ fontSize: '1rem' }} />
                  </Link>
                </StyledCardFooterButton>
              )}
              {!isPending && remainingSwaps.gt(BigNumber.from(0)) && (
                <StyledCardFooterButton
                  variant="contained"
                  color="migrate"
                  onClick={() => onMigrate(position)}
                  fullWidth
                  disabled={disabled}
                >
                  <Typography variant="body2">
                    <FormattedMessage description="migratePosition" defaultMessage="Migrate position" />
                  </Typography>
                </StyledCardFooterButton>
              )}
              {!isPending && (toWithdraw.gt(BigNumber.from(0)) || remainingLiquidity.gt(BigNumber.from(0))) && (
                <StyledCardFooterButton
                  variant="contained"
                  color="error"
                  onClick={() => onTerminate(position)}
                  fullWidth
                  disabled={disabled}
                >
                  <Typography variant="body2">
                    <FormattedMessage description="terminate" defaultMessage="Terminate" />
                  </Typography>
                </StyledCardFooterButton>
              )}
            </>
          )}
        </StyledCallToActionContainer>
      </StyledCardContent>
    </StyledCard>
  );
};
export default ActivePosition;
